import { eq } from 'drizzle-orm';

import { PetStage, type PetAnalyticsRecord, type PetStageValue } from '@/types/pet';

import { getDb } from '../database/client';
import { petAnalytics } from '../database/schema';

const DEFAULT_ANALYTICS: PetAnalyticsRecord = {
  currentLevel: 1,
  currentStage: PetStage.EGG,
  totalEvolutions: 0,
  totalExperienceGained: 0,
  positiveMoodDays: 0,
  negativeMoodDays: 0,
  lastMoodRecordDate: null,
};

const mapRow = (row: typeof petAnalytics.$inferSelect): PetAnalyticsRecord => ({
  currentLevel: row.currentLevel,
  currentStage: row.currentStage as PetStageValue,
  totalEvolutions: row.totalEvolutions,
  totalExperienceGained: row.totalExperienceGained,
  positiveMoodDays: row.positiveMoodDays,
  negativeMoodDays: row.negativeMoodDays,
  lastMoodRecordDate: row.lastMoodRecordDate,
});

export const PetAnalyticsRepository = {
  async getOrCreate(): Promise<PetAnalyticsRecord> {
    const db = getDb();
    const rows = await db.select().from(petAnalytics).where(eq(petAnalytics.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(petAnalytics).values({ id: 1, ...DEFAULT_ANALYTICS });
    return DEFAULT_ANALYTICS;
  },

  async save(record: PetAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(petAnalytics)
      .values({
        id: 1,
        currentLevel: record.currentLevel,
        currentStage: record.currentStage,
        totalEvolutions: record.totalEvolutions,
        totalExperienceGained: record.totalExperienceGained,
        positiveMoodDays: record.positiveMoodDays,
        negativeMoodDays: record.negativeMoodDays,
        lastMoodRecordDate: record.lastMoodRecordDate,
      })
      .onConflictDoUpdate({
        target: petAnalytics.id,
        set: {
          currentLevel: record.currentLevel,
          currentStage: record.currentStage,
          totalEvolutions: record.totalEvolutions,
          totalExperienceGained: record.totalExperienceGained,
          positiveMoodDays: record.positiveMoodDays,
          negativeMoodDays: record.negativeMoodDays,
          lastMoodRecordDate: record.lastMoodRecordDate,
        },
      });
  },
};
