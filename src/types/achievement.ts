import type { LootBoxRarityValue } from './inventory';
import type { PetStageValue } from './pet';

export const AchievementCategory = {
  STREAK: 'streak',
  MISSIONS: 'missions',
  XP: 'xp',
  LEVEL: 'level',
  PET: 'pet',
  LOOT_BOXES: 'loot_boxes',
} as const;

export type AchievementCategoryValue =
  (typeof AchievementCategory)[keyof typeof AchievementCategory];

export const AchievementStatus = {
  LOCKED: 'locked',
  IN_PROGRESS: 'in_progress',
  UNLOCKED: 'unlocked',
} as const;

export type AchievementStatusValue =
  (typeof AchievementStatus)[keyof typeof AchievementStatus];

export const AchievementRewardType = {
  COINS: 'coins',
  SHIELD: 'shield',
  LOOT_BOX: 'loot_box',
  TITLE: 'title',
  SPECIAL: 'special',
} as const;

export type AchievementRewardTypeValue =
  (typeof AchievementRewardType)[keyof typeof AchievementRewardType];

export type AchievementReward =
  | { type: typeof AchievementRewardType.COINS; amount: number; label: string }
  | { type: typeof AchievementRewardType.SHIELD; amount: number; label: string }
  | { type: typeof AchievementRewardType.LOOT_BOX; rarity: LootBoxRarityValue; label: string }
  | { type: typeof AchievementRewardType.TITLE; titleKey: string; label: string }
  | { type: typeof AchievementRewardType.SPECIAL; itemKey: string; amount: number; label: string };

export type AchievementMetricType =
  | 'total_study_days'
  | 'best_streak'
  | 'total_missions_completed'
  | 'total_xp_earned'
  | 'player_level'
  | 'pet_stage'
  | 'total_loot_boxes_opened'
  | 'total_duel_wins'
  | 'total_flash_reviews';

export type AchievementTarget = number | PetStageValue;

export type AchievementDefinition = {
  key: string;
  name: string;
  description: string;
  category: AchievementCategoryValue;
  metric: AchievementMetricType;
  target: AchievementTarget;
  icon: string;
  rewards: AchievementReward[];
};

export type AchievementUnlockRecord = {
  achievementKey: string;
  unlockedAt: string;
};

export type AchievementStatsRecord = {
  totalMissionsCompleted: number;
  totalXpEarned: number;
  totalLootBoxesOpened: number;
  totalDuelWins: number;
  totalFlashReviews: number;
};

export type AchievementAnalyticsRecord = {
  totalUnlocked: number;
  totalCoinsGranted: number;
  totalShieldsGranted: number;
  totalLootBoxesGranted: number;
  lastUnlockAt: string | null;
};

export type AchievementProgress = {
  status: AchievementStatusValue;
  current: number;
  target: number;
  percentage: number;
  progressLabel: string;
};

export type AchievementViewModel = AchievementDefinition & {
  progress: AchievementProgress;
  unlockedAt: string | null;
};

export type AchievementUnlockPayload = {
  achievement: AchievementDefinition;
  unlockedAt: string;
  rewards: AchievementReward[];
};

export type AchievementSummary = {
  unlocked: number;
  total: number;
  percentage: number;
};
