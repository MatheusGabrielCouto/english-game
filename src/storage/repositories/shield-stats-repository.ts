import { eq } from 'drizzle-orm';

import type { ShieldStatsRecord } from '@/types/shield';

import { getDb } from '../database/client';
import { shieldStats } from '../database/schema';

const DEFAULT_STATS: ShieldStatsRecord = {
  totalEarned: 0,
  totalConsumed: 0,
  totalStreaksProtected: 0,
  longestProtectedStreak: 0,
};

const mapRow = (row: typeof shieldStats.$inferSelect): ShieldStatsRecord => ({
  totalEarned: row.totalEarned,
  totalConsumed: row.totalConsumed,
  totalStreaksProtected: row.totalStreaksProtected,
  longestProtectedStreak: row.longestProtectedStreak,
});

export const ShieldStatsRepository = {
  async getOrCreate(): Promise<ShieldStatsRecord> {
    const db = getDb();
    const rows = await db.select().from(shieldStats).where(eq(shieldStats.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(shieldStats).values({ id: 1, ...DEFAULT_STATS });
    return DEFAULT_STATS;
  },

  async save(record: ShieldStatsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(shieldStats)
      .values({
        id: 1,
        totalEarned: record.totalEarned,
        totalConsumed: record.totalConsumed,
        totalStreaksProtected: record.totalStreaksProtected,
        longestProtectedStreak: record.longestProtectedStreak,
      })
      .onConflictDoUpdate({
        target: shieldStats.id,
        set: {
          totalEarned: record.totalEarned,
          totalConsumed: record.totalConsumed,
          totalStreaksProtected: record.totalStreaksProtected,
          longestProtectedStreak: record.longestProtectedStreak,
        },
      });
  },
};
