export const LegacyCategory = {
  ORIGIN: 'origin',
  STREAK: 'streak',
  PET: 'pet',
  CONTRACT: 'contract',
  CAREER: 'career',
  ACHIEVEMENT: 'achievement',
} as const;

export type LegacyCategoryValue = (typeof LegacyCategory)[keyof typeof LegacyCategory];

export type LegacyMilestoneRecord = {
  milestoneKey: string;
  category: LegacyCategoryValue;
  title: string;
  description: string;
  occurredAt: string;
  recordedAt: string;
};

export type MetagameStateRecord = {
  prestigeLevel: number;
  seasonKey: string;
  seasonPoints: number;
  /** Tiers já resgatados na temporada atual (1–5). */
  seasonClaimedTiers: number[];
  annualProgress: Record<string, number>;
  updatedAt: string;
};

export type SeasonTierStatus = 'locked' | 'claimable' | 'claimed';

export type SeasonTierView = {
  tier: number;
  pointsRequired: number;
  rewardLabel: string;
  status: SeasonTierStatus;
};

export type CollectionCategoryKey = 'pets' | 'items' | 'titles' | 'achievements' | 'relics';

export type CollectionCategoryDetail = {
  key: CollectionCategoryKey;
  label: string;
  emoji: string;
  description: string;
  discovered: number;
  total: number;
  percentage: number;
  tone: 'primary' | 'accent' | 'gold' | 'success' | 'warning';
  preview: string[];
  hint: string;
};

export type CollectionSummary = {
  overallPercentage: number;
  categories: CollectionCategoryDetail[];
  pets: { discovered: number; total: number };
  items: { owned: number; total: number };
  titles: { unlocked: number; total: number };
  achievements: { unlocked: number; total: number };
  relics: { unlocked: number; total: number };
};

export type AnnualGoal = {
  key: string;
  name: string;
  description: string;
  icon: string;
  target: number;
  metric: 'study_days' | 'missions' | 'xp' | 'streak_best';
};

export type AnnualGoalProgress = AnnualGoal & {
  current: number;
  percentage: number;
  completed: boolean;
};

export type SeasonTier = {
  tier: number;
  pointsRequired: number;
  rewardLabel: string;
};

export type PrestigeTier = {
  level: number;
  name: string;
  requiredLevel: number;
  rewardLabel: string;
};

export type CoreLoopStep = {
  key: string;
  label: string;
  emoji: string;
  description: string;
};

export type CoreLoopSnapshot = {
  daily: { completed: number; total: number; studiedToday: boolean };
  weekly: { completed: number; total: number; claimed: number };
  monthly: { seasonPoints: number; seasonTier: number; daysLeft: number };
  retention: { currentStreak: number; bestStreak: number; d1Ready: boolean };
};
