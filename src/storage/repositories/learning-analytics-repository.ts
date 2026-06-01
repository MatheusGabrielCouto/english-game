import { eq } from 'drizzle-orm';

import type { LearningAnalyticsRecord } from '@/types/learning-analytics';

import { getDb } from '../database/client';
import { learningAnalytics } from '../database/schema';

const ROW_ID = 1;

const DEFAULT: LearningAnalyticsRecord = {
  duelWins: 0,
  duelLosses: 0,
  duelSessions: 0,
  duelFlawlessWins: 0,
  flashReviews: 0,
  flashSessions: 0,
  cardsSavedFromDuel: 0,
  weeklyBossWins: 0,
  updatedAt: new Date().toISOString(),
};

const mapRow = (row: typeof learningAnalytics.$inferSelect): LearningAnalyticsRecord => ({
  duelWins: row.duelWins,
  duelLosses: row.duelLosses,
  duelSessions: row.duelSessions,
  duelFlawlessWins: row.duelFlawlessWins,
  flashReviews: row.flashReviews,
  flashSessions: row.flashSessions,
  cardsSavedFromDuel: row.cardsSavedFromDuel,
  weeklyBossWins: row.weeklyBossWins,
  updatedAt: row.updatedAt,
});

export const LearningAnalyticsRepository = {
  async getOrCreate(): Promise<LearningAnalyticsRecord> {
    const db = getDb();
    const rows = await db
      .select()
      .from(learningAnalytics)
      .where(eq(learningAnalytics.id, ROW_ID))
      .limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(learningAnalytics).values({
      id: ROW_ID,
      ...DEFAULT,
      updatedAt: new Date().toISOString(),
    });

    return { ...DEFAULT, updatedAt: new Date().toISOString() };
  },

  async save(record: LearningAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(learningAnalytics)
      .values({
        id: ROW_ID,
        duelWins: record.duelWins,
        duelLosses: record.duelLosses,
        duelSessions: record.duelSessions,
        duelFlawlessWins: record.duelFlawlessWins,
        flashReviews: record.flashReviews,
        flashSessions: record.flashSessions,
        cardsSavedFromDuel: record.cardsSavedFromDuel,
        weeklyBossWins: record.weeklyBossWins,
        updatedAt: record.updatedAt,
      })
      .onConflictDoUpdate({
        target: learningAnalytics.id,
        set: {
          duelWins: record.duelWins,
          duelLosses: record.duelLosses,
          duelSessions: record.duelSessions,
          duelFlawlessWins: record.duelFlawlessWins,
          flashReviews: record.flashReviews,
          flashSessions: record.flashSessions,
          cardsSavedFromDuel: record.cardsSavedFromDuel,
          weeklyBossWins: record.weeklyBossWins,
          updatedAt: record.updatedAt,
        },
      });
  },

  async increment(
    patch: Partial<Omit<LearningAnalyticsRecord, 'updatedAt'>>,
  ): Promise<LearningAnalyticsRecord> {
    const current = await LearningAnalyticsRepository.getOrCreate();
    const next: LearningAnalyticsRecord = {
      duelWins: current.duelWins + (patch.duelWins ?? 0),
      duelLosses: current.duelLosses + (patch.duelLosses ?? 0),
      duelSessions: current.duelSessions + (patch.duelSessions ?? 0),
      duelFlawlessWins: current.duelFlawlessWins + (patch.duelFlawlessWins ?? 0),
      flashReviews: current.flashReviews + (patch.flashReviews ?? 0),
      flashSessions: current.flashSessions + (patch.flashSessions ?? 0),
      cardsSavedFromDuel: current.cardsSavedFromDuel + (patch.cardsSavedFromDuel ?? 0),
      weeklyBossWins: current.weeklyBossWins + (patch.weeklyBossWins ?? 0),
      updatedAt: new Date().toISOString(),
    };
    await LearningAnalyticsRepository.save(next);
    return next;
  },
};
