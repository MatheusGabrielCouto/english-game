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
  totalRoutinesCompleted: 0,
  totalJournalEntries: 0,
  totalJournalVoiceNotes: 0,
  totalJournalReviews: 0,
  totalJournalConnections: 0,
};

const mapRow = (row: typeof achievementStats.$inferSelect): AchievementStatsRecord => ({
  totalMissionsCompleted: row.totalMissionsCompleted,
  totalXpEarned: row.totalXpEarned,
  totalLootBoxesOpened: row.totalLootBoxesOpened,
  totalDuelWins: row.totalDuelWins ?? 0,
  totalFlashReviews: row.totalFlashReviews ?? 0,
  totalRoutinesCompleted: row.totalRoutinesCompleted ?? 0,
  totalJournalEntries: row.totalJournalEntries ?? 0,
  totalJournalVoiceNotes: row.totalJournalVoiceNotes ?? 0,
  totalJournalReviews: row.totalJournalReviews ?? 0,
  totalJournalConnections: row.totalJournalConnections ?? 0,
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
      totalRoutinesCompleted: DEFAULT_STATS.totalRoutinesCompleted,
      totalJournalEntries: DEFAULT_STATS.totalJournalEntries,
      totalJournalVoiceNotes: DEFAULT_STATS.totalJournalVoiceNotes,
      totalJournalReviews: DEFAULT_STATS.totalJournalReviews,
      totalJournalConnections: DEFAULT_STATS.totalJournalConnections,
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
        totalRoutinesCompleted: record.totalRoutinesCompleted,
        totalJournalEntries: record.totalJournalEntries,
        totalJournalVoiceNotes: record.totalJournalVoiceNotes,
        totalJournalReviews: record.totalJournalReviews,
        totalJournalConnections: record.totalJournalConnections,
      })
      .onConflictDoUpdate({
        target: achievementStats.id,
        set: {
          totalMissionsCompleted: record.totalMissionsCompleted,
          totalXpEarned: record.totalXpEarned,
          totalLootBoxesOpened: record.totalLootBoxesOpened,
          totalDuelWins: record.totalDuelWins,
          totalFlashReviews: record.totalFlashReviews,
          totalRoutinesCompleted: record.totalRoutinesCompleted,
          totalJournalEntries: record.totalJournalEntries,
          totalJournalVoiceNotes: record.totalJournalVoiceNotes,
          totalJournalReviews: record.totalJournalReviews,
          totalJournalConnections: record.totalJournalConnections,
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

  async incrementRoutines(amount = 1): Promise<AchievementStatsRecord> {
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalRoutinesCompleted: stats.totalRoutinesCompleted + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },

  async incrementJournalEntries(amount = 1): Promise<AchievementStatsRecord> {
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalJournalEntries: stats.totalJournalEntries + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },

  async incrementJournalVoiceNotes(amount = 1): Promise<AchievementStatsRecord> {
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalJournalVoiceNotes: stats.totalJournalVoiceNotes + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },

  async incrementJournalReviews(amount = 1): Promise<AchievementStatsRecord> {
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalJournalReviews: stats.totalJournalReviews + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },

  async incrementJournalConnections(amount = 1): Promise<AchievementStatsRecord> {
    const stats = await AchievementStatsRepository.getOrCreate();
    const next = {
      ...stats,
      totalJournalConnections: stats.totalJournalConnections + amount,
    };
    await AchievementStatsRepository.save(next);
    return next;
  },
};
