export type StudyPointsBalance = {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
  updatedAt: string;
};

export type StudyPointsTransaction = {
  id: number;
  amount: number;
  reason: string;
  source: string;
  createdAt: string;
};

export const StudyPointsSource = {
  VOCABULARY: 'vocabulary',
  READING: 'reading',
  LISTENING: 'listening',
  SPEAKING: 'speaking',
  PROGRAMMING: 'programming',
  EXERCISE: 'exercise',
  REVIEW: 'review',
  SHOP: 'shop',
  LOOT_BOX: 'loot_box',
  SYSTEM: 'system',
} as const;

export type StudyPointsSourceValue =
  (typeof StudyPointsSource)[keyof typeof StudyPointsSource];
