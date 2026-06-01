import { LOOT_PITY_THRESHOLD } from '@/features/game-design/constants/balance';
import { RewardModifierService } from '@/features/game-design/services/reward-modifier-service';
import { CollectionBookService } from '@/features/collection-book/services/collection-book-service';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { PlayerService } from '@/features/player/services/player-service';
import { ShieldService } from '@/features/shields/services/shield-service';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { GameEvents } from '@/services/game-events';
import { getAppSettings, saveAppSettings } from '@/storage/repositories/app-settings-repository';
import { InventoryLootBoxRepository } from '@/storage/repositories/inventory-loot-box-repository';
import { LootBoxAnalyticsRepository } from '@/storage/repositories/loot-box-analytics-repository';
import { LootBoxOpenHistoryRepository } from '@/storage/repositories/loot-box-open-history-repository';
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';
import {
  LootBoxRewardType,
  type LootBoxOpenResult,
  type LootBoxReward,
} from '@/types/loot-box';

import { pickLootBoxReward } from '../utils/rewards';
import { pickCollectibleForLootBox } from '../utils/pick-collectible';
import { grantLootBoxReward } from './loot-box-grant';

const LOOT_BOX_UPGRADE: Partial<Record<LootBoxRarityValue, LootBoxRarityValue>> = {
  [LootBoxRarity.COMMON]: LootBoxRarity.UNCOMMON,
  [LootBoxRarity.UNCOMMON]: LootBoxRarity.RARE,
  [LootBoxRarity.RARE]: LootBoxRarity.EPIC,
  [LootBoxRarity.EPIC]: LootBoxRarity.LEGENDARY,
  [LootBoxRarity.LEGENDARY]: LootBoxRarity.MYTHIC,
  [LootBoxRarity.MYTHIC]: LootBoxRarity.ANCIENT,
};

const isHighValueReward = (reward: LootBoxReward, boxRarity: LootBoxRarityValue): boolean => {
  if (reward.type === LootBoxRewardType.LOOT_BOX && reward.rarity && reward.rarity !== boxRarity) {
    return true;
  }
  if (reward.type === LootBoxRewardType.COLLECTIBLE) return true;
  if (reward.type === LootBoxRewardType.SPECIAL) return true;
  if (reward.type === LootBoxRewardType.STUDY_POINTS && reward.amount >= 80) return true;
  if (reward.type === LootBoxRewardType.COINS && reward.amount >= 200) return true;
  return false;
};

const applyReward = async (
  reward: LootBoxReward,
  boxRarity: LootBoxRarityValue,
  lootLuck = 0,
): Promise<LootBoxReward> => {
  switch (reward.type) {
    case LootBoxRewardType.COINS:
      PlayerService.addCoins(reward.amount);
      break;
    case LootBoxRewardType.SHIELD:
      await ShieldService.grantShields(reward.amount, 'loot_box');
      break;
    case LootBoxRewardType.LOOT_BOX:
      if (reward.rarity) {
        await InventoryService.addLootBox(reward.rarity, 'loot_box');
      }
      break;
    case LootBoxRewardType.SPECIAL:
      if (reward.itemKey) {
        await InventoryService.addSpecialItem(reward.itemKey, reward.amount, 'loot_box');
      }
      break;
    case LootBoxRewardType.STUDY_POINTS:
      await StudyPointsService.earn(reward.amount, reward.label, 'loot_box');
      break;
    case LootBoxRewardType.COLLECTIBLE: {
      const collectible = pickCollectibleForLootBox(boxRarity, Math.random(), lootLuck);
      await CollectionBookService.discover(collectible.key);
      return {
        ...reward,
        label: collectible.name,
        collectibleKey: collectible.key,
      };
    }
    default:
      break;
  }

  return reward;
};

export const LootBoxService = {
  async openLootBox(id: number): Promise<LootBoxOpenResult | null> {
    const box = await InventoryLootBoxRepository.findById(id);
    if (!box || box.opened) return null;

    const lootLuck = RewardModifierService.getLootLuckFactor();
    const settings = await getAppSettings();
    let pityCounter = settings.lootPityCounter;

    let reward = pickLootBoxReward(box.rarity);
    if (pityCounter >= LOOT_PITY_THRESHOLD - 1) {
      const upgraded = LOOT_BOX_UPGRADE[box.rarity];
      if (upgraded) {
        reward = {
          type: LootBoxRewardType.LOOT_BOX,
          amount: 1,
          rarity: upgraded,
          label: `Upgrade garantido (${upgraded})`,
        };
      }
      pityCounter = 0;
    } else if (isHighValueReward(reward, box.rarity)) {
      pityCounter = 0;
    } else {
      pityCounter += 1;
    }

    await saveAppSettings({ ...settings, lootPityCounter: pityCounter });

    const appliedReward = await applyReward(reward, box.rarity, lootLuck);
    await InventoryLootBoxRepository.markOpened(id);

    const openedAt = new Date().toISOString();
    await LootBoxOpenHistoryRepository.create({
      lootBoxId: id,
      boxRarity: box.rarity,
      rewardType: appliedReward.type,
      rewardAmount: appliedReward.amount,
      rewardLabel: appliedReward.label,
      rewardRarity: appliedReward.rarity ?? null,
      rewardItemKey: appliedReward.itemKey ?? appliedReward.collectibleKey ?? null,
      openedAt,
    });

    await LootBoxAnalyticsRepository.recordOpened(box.rarity, appliedReward);
    await InventoryService.refresh();

    const result: LootBoxOpenResult = {
      boxId: id,
      boxRarity: box.rarity,
      reward: appliedReward,
    };

    GameEvents.emit({ type: 'LOOT_BOX_OPENED', result });
    return result;
  },

  async getUnopenedBoxes() {
    return InventoryLootBoxRepository.findUnopened();
  },

  async getOpenHistory(limit = 15) {
    return LootBoxOpenHistoryRepository.findRecent(limit);
  },

  async getAnalytics() {
    return LootBoxAnalyticsRepository.getOrCreate();
  },

  async grantLootBox(
    rarity: LootBoxRarityValue,
    source: Parameters<typeof InventoryService.addLootBox>[1] = 'system',
  ) {
    await grantLootBoxReward(rarity, source);
  },
};
