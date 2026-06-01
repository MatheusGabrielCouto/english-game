import { eq } from 'drizzle-orm';

import { DEFAULT_BUILDING_KEY } from '@/features/city/constants/default-buildings';
import type { CityAnalyticsRecord } from '@/types/city';

import { getDb } from '../database/client';
import { cityAnalytics } from '../database/schema';

const DEFAULT_ANALYTICS: CityAnalyticsRecord = {
  currentBuildingKey: DEFAULT_BUILDING_KEY,
  totalUnlocked: 0,
  lastUnlockAt: null,
};

const mapRow = (row: typeof cityAnalytics.$inferSelect): CityAnalyticsRecord => ({
  currentBuildingKey: row.currentBuildingKey,
  totalUnlocked: row.totalUnlocked,
  lastUnlockAt: row.lastUnlockAt,
});

export const CityAnalyticsRepository = {
  async getOrCreate(): Promise<CityAnalyticsRecord> {
    const db = getDb();
    const rows = await db.select().from(cityAnalytics).where(eq(cityAnalytics.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(cityAnalytics).values({ id: 1, ...DEFAULT_ANALYTICS });
    return DEFAULT_ANALYTICS;
  },

  async save(record: CityAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(cityAnalytics)
      .values({
        id: 1,
        currentBuildingKey: record.currentBuildingKey,
        totalUnlocked: record.totalUnlocked,
        lastUnlockAt: record.lastUnlockAt,
      })
      .onConflictDoUpdate({
        target: cityAnalytics.id,
        set: {
          currentBuildingKey: record.currentBuildingKey,
          totalUnlocked: record.totalUnlocked,
          lastUnlockAt: record.lastUnlockAt,
        },
      });
  },

  async recordUnlock(
    buildingKey: string,
    totalUnlocked: number,
    unlockedAt: string,
  ): Promise<CityAnalyticsRecord> {
    const next: CityAnalyticsRecord = {
      currentBuildingKey: buildingKey,
      totalUnlocked,
      lastUnlockAt: unlockedAt,
    };

    await CityAnalyticsRepository.save(next);
    return next;
  },
};
