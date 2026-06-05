import { LOOT_BOX_UPGRADE_CHAIN, STUDY_POINTS_SHOP } from '@/features/game-design/catalogs/loot-economy';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { grantLootBoxReward } from '@/features/loot-boxes/services/loot-box-grant';
import { getTodayOfferStorageKey } from '@/features/shop/utils/shop-offer-keys';
import { getStockPeriodKey } from '@/features/shop/utils/shop-stock-keys';
import { GameEvents } from '@/services/game-events';
import { InventoryLootBoxRepository } from '@/storage/repositories/inventory-loot-box-repository';
import { ShopOfferRepository } from '@/storage/repositories/shop-offer-repository';
import { ShopStockRepository } from '@/storage/repositories/shop-stock-repository';
import {
    getOrCreateStudyPointsBalance,
    getRecentStudyPointsHistory,
    recordStudyPointsTransaction,
    saveStudyPointsBalance,
} from '@/storage/repositories/study-points-repository';
import type { LootBoxRarityValue } from '@/types/inventory';
import { ShopOfferKind } from '@/types/shop-offer';

import { useStudyPointsStore } from '../store/study-points-store';

const refreshStore = async (): Promise<void> => {
  const [balance, history] = await Promise.all([
    getOrCreateStudyPointsBalance(),
    getRecentStudyPointsHistory(15),
  ]);

  useStudyPointsStore.setState({ balance, history, isLoading: false });
};

export const StudyPointsService = {
  async initialize(): Promise<void> {
    await refreshStore();
  },

  async earn(amount: number, reason: string, source: string): Promise<number> {
    if (amount <= 0) return 0;

    const balance = await getOrCreateStudyPointsBalance();
    const next = {
      ...balance,
      balance: balance.balance + amount,
      lifetimeEarned: balance.lifetimeEarned + amount,
      updatedAt: new Date().toISOString(),
    };

    await saveStudyPointsBalance(next);
    await recordStudyPointsTransaction(amount, reason, source);
    await refreshStore();

    GameEvents.emit({ type: 'STUDY_POINTS_EARNED', amount, reason, source });
    return next.balance;
  },

  async spend(amount: number, reason: string, source: string): Promise<boolean> {
    const balance = await getOrCreateStudyPointsBalance();
    if (balance.balance < amount) return false;

    const next = {
      ...balance,
      balance: balance.balance - amount,
      lifetimeSpent: balance.lifetimeSpent + amount,
      updatedAt: new Date().toISOString(),
    };

    await saveStudyPointsBalance(next);
    await recordStudyPointsTransaction(-amount, reason, source);
    await refreshStore();
    return true;
  },

  async purchaseShopItem(
    shopKey: string,
    options?: { priceOverride?: number; offerStorageKey?: string; stockStorageKey?: string },
  ): Promise<boolean> {
    const product = STUDY_POINTS_SHOP.find((entry) => entry.key === shopKey);
    if (!product) return false;

    let cost: number = product.cost;

    if (options?.stockStorageKey) {
      const stockRecord = await ShopStockRepository.findByStorageKey(options.stockStorageKey);
      const currentPeriodKey = stockRecord
        ? getStockPeriodKey(stockRecord.periodType as import('@/types/shop-stock').ShopStockPeriodValue)
        : null;

      if (
        !stockRecord ||
        stockRecord.productKey !== shopKey ||
        stockRecord.shopKind !== ShopOfferKind.STUDY_POINTS ||
        stockRecord.stockRemaining <= 0 ||
        stockRecord.periodKey !== currentPeriodKey
      ) {
        return false;
      }
    } else if (options?.priceOverride != null || options?.offerStorageKey != null) {
      const expectedStorageKey = getTodayOfferStorageKey(ShopOfferKind.STUDY_POINTS);
      const offerStorageKey = options.offerStorageKey ?? expectedStorageKey;

      if (offerStorageKey !== expectedStorageKey) return false;

      const offerRecord = await ShopOfferRepository.findByDateKey(offerStorageKey);
      if (
        !offerRecord?.hasOffer ||
        offerRecord.purchased ||
        offerRecord.productKey !== shopKey ||
        offerRecord.offerPrice == null
      ) {
        return false;
      }

      if (options.priceOverride != null && options.priceOverride !== offerRecord.offerPrice) {
        return false;
      }

      cost = offerRecord.offerPrice;
    }

    const spent = await StudyPointsService.spend(cost, product.label, 'shop');
    if (!spent) return false;

    if ('lootRarity' in product && product.lootRarity) {
      await grantLootBoxReward(product.lootRarity as LootBoxRarityValue, 'study_points');
    }

    if ('itemKey' in product && product.itemKey) {
      await InventoryService.addSpecialItem(product.itemKey, 1, 'study_points');
    }

    return true;
  },

  async upgradeLootBox(fromRarity: LootBoxRarityValue): Promise<'success' | 'no_box' | 'insufficient_sp'> {
    const step = LOOT_BOX_UPGRADE_CHAIN.find((entry) => entry.from === fromRarity);
    if (!step) return 'no_box';

    const sourceBox = await InventoryLootBoxRepository.findFirstUnopenedByRarity(fromRarity);
    if (!sourceBox) return 'no_box';

    const balance = await getOrCreateStudyPointsBalance();
    if (balance.balance < step.costStudyPoints) return 'insufficient_sp';

    const spent = await StudyPointsService.spend(
      step.costStudyPoints,
      `Upgrade ${step.from} → ${step.to}`,
      'loot_upgrade',
    );
    if (!spent) return 'insufficient_sp';

    const consumed = await InventoryService.consumeLootBoxForUpgrade(sourceBox.id);
    if (!consumed) {
      await StudyPointsService.earn(
        step.costStudyPoints,
        `Reembolso: upgrade ${step.from} → ${step.to}`,
        'loot_upgrade_refund',
      );
      return 'no_box';
    }

    await InventoryService.addLootBox(step.to as LootBoxRarityValue, 'sp_upgrade');
    await InventoryService.refresh();

    return 'success';
  },

  refresh: refreshStore,
};
