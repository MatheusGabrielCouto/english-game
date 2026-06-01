import { eq } from 'drizzle-orm';

import type { AchievementStatsRecord } from '@/types/achievement';

import { getDb } from '../database/client';
import { achievementStats } from '../database/schema';

const DEFAULT_STATS: AchievementStatsRecord = {
  totalMissionsCompleted: 0,
  totalXpEarned: 0,
  totalLootBoxesOpened: 0,
  totalDuelWins: 0,
  totalFlashReviews: 0,
};

const mapRow = (row: typeof achievementStats.$inferSelect): AchievementStatsRecord => ({
  totalMissionsCompleted: row.totalMissionsCompleted,
  totalXpEarned: row.totalXpEarned,
  totalLootBoxesOpened: row.totalLootBoxesOpened,
  totalDuelWins: row.totalDuelWins ?? 0,
  totalFlashReviews: row.totalFlashReviews ?? 0,
});

export const AchievementStatsRepository = {
  async getOrCreate(): Promise<AchievementStatsRecord> {
    const db = getDb();
    const rows = await db.select().from(achievementStats).where(eq(achievementStats.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(achievementStats).values({
      id: 1,
      totalMissionsCompleted: DEFAULT_STATS.totalMissionsCompleted,
      totalXpEarned: DEFAULT_STATS.totalXpEarned,
      totalLootBoxesOpened: DEFAULT_STATS.totalLootBoxesOpened,
      totalDuelWins: DEFAULT_STATS.totalDuelWins,
      totalFlashReviews: DEFAULT_STATS.totalFlashReviews,
    });

    return DEFAULT_STATS;
  },

  async save(record: AchievementStatsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(achievementStats)
      .values({
        id: 1,
        totalMissionsCompleted: record.totalMissionsCompleted,
        totalXpEarned: record.totalXpEarned,
        totalLootBoxesOpened: record.totalLootBoxesOpened,
        totalDuelWins: record.totalDuelWins,
        totalFlashReviews: record.totalFlashReviews,
      })
      .onConflictDoUpdate({
        target: achievementStats.id,
        set: {
          totalMissionsCompleted: record.totalMissionsCompleted,
          totalXpEarned: record.totalXpEarned,
          totalLootBoxesOpened: record.totalLootBoxesOpened,
          totalDuelWins: record.totalDuelWins,
          totalFlashReviews: record.totalFlashReviews,
        },
      });
  },

  async incrementMissions(amount = 1): Promise<AchievementStatsRecord> {
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalMissionsCompleted: stats.totalMissionsCompleted + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },

  async incrementXp(amount: number): Promise<AchievementStatsRecord> {
    if (amount <= 0) return AchievementStatsRepository.getOrCreate();
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalXpEarned: stats.totalXpEarned + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },

  async incrementLootBoxes(amount = 1): Promise<AchievementStatsRecord> {
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalLootBoxesOpened: stats.totalLootBoxesOpened + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },

  async incrementDuelWins(amount = 1): Promise<AchievementStatsRecord> {
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalDuelWins: stats.totalDuelWins + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },

  async incrementFlashReviews(amount: number): Promise<AchievementStatsRecord> {
    if (amount <= 0) return AchievementStatsRepository.getOrCreate();
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalFlashReviews: stats.totalFlashReviews + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },
};
