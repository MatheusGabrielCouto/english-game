export const StatisticsMilestoneCategory = {
  STUDY: 'study',
  STREAK: 'streak',
  CONTRACT: 'contract',
  ACHIEVEMENT: 'achievement',
  TITLE: 'title',
  LOOT_BOX: 'loot_box',
  PET: 'pet',
  CITY: 'city',
  LEVEL: 'level',
  SYSTEM: 'system',
} as const;

export type StatisticsMilestoneCategoryValue =
  (typeof StatisticsMilestoneCategory)[keyof typeof StatisticsMilestoneCategory];

export type StatisticsMilestoneRecord = {
  id: number;
  category: StatisticsMilestoneCategoryValue;
  milestoneKey: string;
  label: string;
  value: number | null;
  metadataJson: string | null;
  occurredAt: string;
};

export type PlayerStatisticsRecord = {
  totalStudyMinutes: number;
  updatedAt: string;
};

export type StatMetric = {
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'accent' | 'danger' | 'primary';
};

export type StatisticsInsight = {
  id: string;
  message: string;
  category: StatisticsMilestoneCategoryValue | 'general';
};

export type StatisticsOverview = {
  totalStudyDays: number;
  totalStudyTimeLabel: string;
  totalXp: number;
  currentLevel: number;
  currentTitle: string;
  totalCoinsEarned: number;
};

export type StatisticsConsistency = {
  currentStreak: number;
  bestStreak: number;
  totalStudyDays: number;
  streaksProtected: number;
  shieldsConsumed: number;
};

export type StatisticsQuests = {
  dailyCompleted: number;
  dailyTotal: number;
  dailyCompletionRate: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  weeklyCompletionRate: number;
};

export type StatisticsPet = {
  stageLabel: string;
  stageEmoji: string;
  level: number;
  totalEvolutions: number;
  averageMoodLabel: string;
  averageMoodScore: number;
};

export type StatisticsLootBoxes = {
  totalReceived: number;
  totalOpened: number;
  bestRewardLabel: string;
  highestRarityLabel: string | null;
};

export type StatisticsAchievements = {
  unlocked: number;
  total: number;
  completionRate: number;
  topCategoryLabel: string | null;
};

export type StatisticsContracts = {
  totalAccepted: number;
  totalCompleted: number;
  successRate: number;
  largestCompletedLabel: string | null;
};

export type StatisticsCity = {
  currentBuildingLabel: string;
  currentBuildingEmoji: string;
  totalUnlocked: number;
  totalBuildings: number;
  progressPercentage: number;
};

export type StatisticsDashboard = {
  overview: StatisticsOverview;
  consistency: StatisticsConsistency;
  quests: StatisticsQuests;
  pet: StatisticsPet;
  lootBoxes: StatisticsLootBoxes;
  achievements: StatisticsAchievements;
  contracts: StatisticsContracts;
  city: StatisticsCity;
  insights: StatisticsInsight[];
  milestones: StatisticsMilestoneRecord[];
};
