export const RoutineFrequency = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
} as const;

export type RoutineFrequencyValue =
  (typeof RoutineFrequency)[keyof typeof RoutineFrequency];

export const RoutineCategory = {
  ENGLISH_COURSE: 'english_course',
  SPEAKING: 'speaking',
  READING: 'reading',
  VOCABULARY: 'vocabulary',
  LISTENING: 'listening',
  WRITING: 'writing',
  GRAMMAR: 'grammar',
  CAREER: 'career',
  PROGRAMMING_ENGLISH: 'programming_english',
  PERSONAL: 'personal',
} as const;

export type RoutineCategoryValue =
  (typeof RoutineCategory)[keyof typeof RoutineCategory];

export type UserRoutineRecord = {
  id: string;
  name: string;
  description: string | null;
  category: RoutineCategoryValue;
  frequency: RoutineFrequencyValue;
  reminderTime: string | null;
  weekdays: number[];
  expectedDurationMin: number | null;
  customXp: number | null;
  customCoins: number | null;
  templateKey: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RoutineCompletionRecord = {
  id: string;
  routineId: string;
  periodKey: string;
  completedAt: string;
  xpAwarded: number;
  coinsAwarded: number;
  studyPointsAwarded: number;
};

export type RoutineStatsRecord = {
  routineId: string;
  totalCompleted: number;
  totalMissed: number;
  currentStreak: number;
  bestStreak: number;
  lastCompletedPeriod: string | null;
  updatedAt: string;
};

export type RoutineConsistencyLabel = 'excellent' | 'good' | 'fair' | 'poor';

export type RoutineTodayItem = {
  routine: UserRoutineRecord;
  stats: RoutineStatsRecord;
  periodKey: string;
  completed: boolean;
  completion: RoutineCompletionRecord | null;
  isDueToday: boolean;
  completionRate: number;
  consistencyLabel: RoutineConsistencyLabel;
};

export type RoutineRewards = {
  xp: number;
  coins: number;
  studyPoints: number;
};
