export type LearningAnalyticsRecord = {
  duelWins: number;
  duelLosses: number;
  duelSessions: number;
  duelFlawlessWins: number;
  flashReviews: number;
  flashSessions: number;
  cardsSavedFromDuel: number;
  weeklyBossWins: number;
  updatedAt: string;
};

export type LearningAnalyticsSnapshot = LearningAnalyticsRecord & {
  duelWinRate: number;
  cardsSavedFromDuelRate: number;
  avgFlashReviewsPerSession: number;
};
