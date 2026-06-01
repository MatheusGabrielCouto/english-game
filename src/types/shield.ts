export type ShieldUsageRecord = {
  id: number;
  usedAt: string;
  missedDate: string;
  streakProtected: number;
  shieldsRemaining: number;
};

export type ShieldStatsRecord = {
  totalEarned: number;
  totalConsumed: number;
  totalStreaksProtected: number;
  longestProtectedStreak: number;
};

export type ShieldMilestoneKey = 'streak_7' | 'streak_30' | 'streak_100';

export type ShieldGrantSource = 'milestone' | 'loot_box' | 'shop' | 'achievement' | 'event' | 'contract';

export type ShieldProtectionResult = {
  currentStreak: number;
  shields: number;
  lastStudyDate: string | null;
  shieldsConsumed: number;
  streakBroken: boolean;
};
