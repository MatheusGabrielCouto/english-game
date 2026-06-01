import { eq } from 'drizzle-orm';

import type { PlayerStatisticsRecord } from '@/types/statistics';

import { getDb } from '../database/client';
import { playerStatistics } from '../database/schema';

const DEFAULT_RECORD: PlayerStatisticsRecord = {
  totalStudyMinutes: 0,
  updatedAt: new Date().toISOString(),
};

const mapRow = (row: typeof playerStatistics.$inferSelect): PlayerStatisticsRecord => ({
  totalStudyMinutes: row.totalStudyMinutes,
  updatedAt: row.updatedAt,
});

export const PlayerStatisticsRepository = {
  async getOrCreate(): Promise<PlayerStatisticsRecord> {
    const db = getDb();
    const rows = await db.select().from(playerStatistics).where(eq(playerStatistics.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    const now = new Date().toISOString();
    await db.insert(playerStatistics).values({
      id: 1,
      totalStudyMinutes: 0,
      updatedAt: now,
    });

    return { ...DEFAULT_RECORD, updatedAt: now };
  },

  async addStudyMinutes(minutes: number): Promise<PlayerStatisticsRecord> {
    const db = getDb();
    const current = await this.getOrCreate();
    const nextMinutes = current.totalStudyMinutes + minutes;
    const updatedAt = new Date().toISOString();

    await db
      .insert(playerStatistics)
      .values({
        id: 1,
        totalStudyMinutes: nextMinutes,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: playerStatistics.id,
        set: {
          totalStudyMinutes: nextMinutes,
          updatedAt,
        },
      });

    return { totalStudyMinutes: nextMinutes, updatedAt };
  },

  async setStudyMinutes(minutes: number): Promise<void> {
    const db = getDb();
    const updatedAt = new Date().toISOString();

    await db
      .insert(playerStatistics)
      .values({
        id: 1,
        totalStudyMinutes: minutes,
        updatedAt,
      })
      .onConflictDoUpdate({
        target: playerStatistics.id,
        set: {
          totalStudyMinutes: minutes,
          updatedAt,
        },
      });
  },
};
