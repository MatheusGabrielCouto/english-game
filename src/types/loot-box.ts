import type { LootBoxRarityValue } from './inventory';

export const LootBoxRewardType = {
  COINS: 'coins',
  SHIELD: 'shield',
  LOOT_BOX: 'loot_box',
  SPECIAL: 'special',
  COLLECTIBLE: 'collectible',
  STUDY_POINTS: 'study_points',
} as const;

export type LootBoxRewardTypeValue =
  (typeof LootBoxRewardType)[keyof typeof LootBoxRewardType];

export type LootBoxReward = {
  type: LootBoxRewardTypeValue;
  amount: number;
  label: string;
  rarity?: LootBoxRarityValue;
  itemKey?: string;
  collectibleKey?: string;
};

export type LootBoxOpenResult = {
  boxId: number;
  boxRarity: LootBoxRarityValue;
  reward: LootBoxReward;
};

export type LootBoxOpenHistoryRecord = {
  id: number;
  lootBoxId: number;
  boxRarity: LootBoxRarityValue;
  rewardType: LootBoxRewardTypeValue;
  rewardAmount: number;
  rewardLabel: string;
  rewardRarity: LootBoxRarityValue | null;
  rewardItemKey: string | null;
  openedAt: string;
};

export type LootBoxAnalyticsRecord = {
  totalReceived: number;
  totalOpened: number;
  totalCoinsFromBoxes: number;
  totalShieldsFromBoxes: number;
  biggestCoinReward: number;
  openedCommon: number;
  openedRare: number;
  openedEpic: number;
  openedLegendary: number;
};
