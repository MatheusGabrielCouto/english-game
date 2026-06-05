import { InventoryService } from '@/features/inventory/services/inventory-service';
import { PlayerService } from '@/features/player/services/player-service';
import { getTodayKey } from '@/features/quests/utils/date';
import { ShieldService } from '@/features/shields/services/shield-service';
import { GameEvents } from '@/services/game-events';
import { getPlayer } from '@/storage/repositories/player-repository';
import { ShopAnalyticsRepository } from '@/storage/repositories/shop-analytics-repository';
import { ShopOfferRepository } from '@/storage/repositories/shop-offer-repository';
import { ShopProductStatsRepository } from '@/storage/repositories/shop-product-stats-repository';
import { ShopPurchaseHistoryRepository } from '@/storage/repositories/shop-purchase-history-repository';
import { ShopStockRepository } from '@/storage/repositories/shop-stock-repository';
import {
    ShopProductRewardType,
    ShopPurchaseFailureReason,
    type ShopAnalyticsSummary,
    type ShopProduct,
    type ShopPurchaseHistoryRecord,
    type ShopPurchaseResult,
} from '@/types/shop';
import { ShopOfferKind } from '@/types/shop-offer';

import { SHOP_PRODUCTS, SHOP_PRODUCTS_BY_KEY } from '../constants/shop-products';
import { getDeliveredQuantity } from '../utils/purchase';
import { getTodayOfferStorageKey } from '../utils/shop-offer-keys';
import { getStockPeriodKey } from '../utils/shop-stock-keys';
import { ShopOfferNotificationService } from './shop-offer-notification-service';
import { ShopOfferService } from './shop-offer-service';
import { ShopStockService } from './shop-stock-service';

type ShopPurchaseOptions = {
  priceOverride?: number;
  offerStorageKey?: string;
  stockStorageKey?: string;
};

let cachedAnalytics: ShopAnalyticsSummary | null = null;
let cachedHistory: ShopPurchaseHistoryRecord[] = [];

const deliverReward = async (product: ShopProduct): Promise<void> => {
  const { reward } = product;

  switch (reward.type) {
    case ShopProductRewardType.SHIELD:
      await ShieldService.grantShields(reward.quantity, 'shop');
      break;
    case ShopProductRewardType.LOOT_BOX:
      for (let index = 0; index < reward.quantity; index += 1) {
        await InventoryService.addLootBox(reward.rarity, 'shop');
      }
      break;
    case ShopProductRewardType.SPECIAL_ITEM:
      await InventoryService.addSpecialItem(reward.itemKey, reward.quantity, 'shop');
      break;
    default:
      break;
  }
};

const buildAnalyticsSummary = async (): Promise<ShopAnalyticsSummary> => {
  const analytics = await ShopAnalyticsRepository.getOrCreate();
  const topProduct = await ShopProductStatsRepository.findTopProduct();
  const topCategory = await ShopProductStatsRepository.findTopCategory();

  return {
    ...analytics,
    averagePurchaseValue:
      analytics.totalPurchases > 0
        ? Math.round(analytics.totalCoinsSpent / analytics.totalPurchases)
        : 0,
    topProduct,
    topCategory,
  };
};

const refreshCache = async (): Promise<void> => {
  cachedAnalytics = await buildAnalyticsSummary();
  cachedHistory = await ShopPurchaseHistoryRepository.findRecent();
};

export const ShopService = {
  getProducts(): ShopProduct[] {
    return SHOP_PRODUCTS;
  },

  getProduct(key: string): ShopProduct | undefined {
    return SHOP_PRODUCTS_BY_KEY[key];
  },

  async initialize(): Promise<void> {
    await refreshCache();
    await Promise.all([ShopOfferService.ensureTodayOffers(), ShopStockService.ensureStock()]);
    void ShopOfferNotificationService.rescheduleAll();
  },

  async refresh(): Promise<void> {
    await refreshCache();
  },

  getCachedAnalytics(): ShopAnalyticsSummary | null {
    return cachedAnalytics;
  },

  getCachedHistory(): ShopPurchaseHistoryRecord[] {
    return cachedHistory;
  },

  async getPlayerCoins(): Promise<number> {
    const player = await getPlayer();
    return player?.coins ?? 0;
  },

  canAfford(product: ShopProduct, coins: number): boolean {
    return coins >= product.price;
  },

  async purchase(productKey: string, options?: ShopPurchaseOptions): Promise<ShopPurchaseResult> {
    const product = SHOP_PRODUCTS_BY_KEY[productKey];

    if (!product || !product.available) {
      return { success: false, reason: ShopPurchaseFailureReason.UNAVAILABLE };
    }

    let pricePaid = product.price;

    if (options?.stockStorageKey) {
      const stockRecord = await ShopStockRepository.findByStorageKey(options.stockStorageKey);
      const currentPeriodKey = stockRecord
        ? getStockPeriodKey(stockRecord.periodType as import('@/types/shop-stock').ShopStockPeriodValue)
        : null;

      if (
        !stockRecord ||
        stockRecord.productKey !== productKey ||
        stockRecord.shopKind !== ShopOfferKind.COINS ||
        stockRecord.stockRemaining <= 0 ||
        stockRecord.periodKey !== currentPeriodKey
      ) {
        return { success: false, reason: ShopPurchaseFailureReason.UNAVAILABLE };
      }
    } else if (options?.priceOverride != null || options?.offerStorageKey != null) {
      const expectedStorageKey = getTodayOfferStorageKey(ShopOfferKind.COINS);
      const offerStorageKey = options.offerStorageKey ?? expectedStorageKey;

      if (offerStorageKey !== expectedStorageKey) {
        return { success: false, reason: ShopPurchaseFailureReason.UNAVAILABLE };
      }

      const legacyKey = getTodayKey();
      const offerRecord =
        (await ShopOfferRepository.findByDateKey(offerStorageKey)) ??
        (offerStorageKey.endsWith(`:${ShopOfferKind.COINS}`)
          ? await ShopOfferRepository.findByDateKey(legacyKey)
          : null);
      if (
        !offerRecord?.hasOffer ||
        offerRecord.purchased ||
        offerRecord.productKey !== productKey ||
        offerRecord.offerPrice == null
      ) {
        return { success: false, reason: ShopPurchaseFailureReason.UNAVAILABLE };
      }

      if (options.priceOverride != null && options.priceOverride !== offerRecord.offerPrice) {
        return { success: false, reason: ShopPurchaseFailureReason.UNAVAILABLE };
      }

      pricePaid = offerRecord.offerPrice;
    }

    const player = await getPlayer();
    const coins = player?.coins ?? 0;

    if (coins < pricePaid) {
      return { success: false, reason: ShopPurchaseFailureReason.INSUFFICIENT_COINS };
    }

    const deducted = PlayerService.removeCoins(pricePaid);
    if (!deducted) {
      return { success: false, reason: ShopPurchaseFailureReason.INSUFFICIENT_COINS };
    }

    await deliverReward(product);

    const quantity = getDeliveredQuantity(product);
    const purchasedAt = new Date().toISOString();
    const shieldsPurchased =
      product.reward.type === ShopProductRewardType.SHIELD ? product.reward.quantity : 0;
    const lootBoxesPurchased =
      product.reward.type === ShopProductRewardType.LOOT_BOX ? product.reward.quantity : 0;

    await ShopPurchaseHistoryRepository.create({
      productKey: product.key,
      productName: product.name,
      category: product.category,
      quantity,
      pricePaid,
      purchasedAt,
    });

    await ShopAnalyticsRepository.recordPurchase({
      pricePaid,
      quantity,
      shieldsPurchased,
      lootBoxesPurchased,
      purchasedAt,
    });

    await ShopProductStatsRepository.recordPurchase(product.key, product.category, pricePaid);

    GameEvents.emit({
      type: 'SHOP_PURCHASE_COMPLETED',
      productKey: product.key,
      productName: product.name,
      category: product.category,
      pricePaid,
      quantity,
    });

    await InventoryService.refresh();
    await refreshCache();

    return {
      success: true,
      product,
      coinsSpent: pricePaid,
      quantity,
    };
  },
};
