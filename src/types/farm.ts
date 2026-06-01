export const FarmActivityType = {
  VOCABULARY: 'vocabulary',
  READING: 'reading',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  PROGRAMMING: 'programming',
  EXERCISE: 'exercise',
  REVIEW: 'review',
} as const;

export type FarmActivityTypeValue =
  (typeof FarmActivityType)[keyof typeof FarmActivityType];

export type FarmActivityDefinition = {
  key: FarmActivityTypeValue;
  name: string;
  emoji: string;
  description: string;
  unitLabel: string;
  studyPointsPerUnit: number;
  coinPerUnit: number;
};

export type FarmSessionRecord = {
  id: number;
  activityType: FarmActivityTypeValue;
  amount: number;
  studyPointsEarned: number;
  coinsEarned: number;
  recordedAt: string;
};

export type FarmDailyStats = {
  activityType: FarmActivityTypeValue;
  totalAmount: number;
  totalStudyPoints: number;
  sessionsCount: number;
};
