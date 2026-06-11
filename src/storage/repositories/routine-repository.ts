import { and, count, desc, eq, inArray } from 'drizzle-orm';

import {
    mapRoutineRow,
    serializeWeekdays,
} from '@/features/routines/utils/routine-schedule';
import {
    routineCompletions,
    routineStats,
    userRoutines,
} from '@/storage/database/schema';
import type {
    RoutineCompletionRecord,
    RoutineStatsRecord,
    UserRoutineRecord,
} from '@/types/routine';

import { getDb } from '../database/client';

const mapStatsRow = (row: typeof routineStats.$inferSelect): RoutineStatsRecord => ({
  routineId: row.routineId,
  totalCompleted: row.totalCompleted,
  totalMissed: row.totalMissed,
  currentStreak: row.currentStreak,
  bestStreak: row.bestStreak,
  lastCompletedPeriod: row.lastCompletedPeriod,
  updatedAt: row.updatedAt,
});

const mapCompletionRow = (
  row: typeof routineCompletions.$inferSelect,
): RoutineCompletionRecord => ({
  id: row.id,
  routineId: row.routineId,
  periodKey: row.periodKey,
  completedAt: row.completedAt,
  xpAwarded: row.xpAwarded,
  coinsAwarded: row.coinsAwarded,
  studyPointsAwarded: row.studyPointsAwarded,
});

const emptyStats = (routineId: string): RoutineStatsRecord => ({
  routineId,
  totalCompleted: 0,
  totalMissed: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastCompletedPeriod: null,
  updatedAt: new Date().toISOString(),
});

export const RoutineRepository = {
  async listActive(): Promise<UserRoutineRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(userRoutines)
      .where(eq(userRoutines.isArchived, false))
      .orderBy(desc(userRoutines.updatedAt));

    return rows.map(mapRoutineRow);
  },

  async listAll(): Promise<UserRoutineRecord[]> {
    const db = getDb();
    const rows = await db.select().from(userRoutines).orderBy(desc(userRoutines.updatedAt));
    return rows.map(mapRoutineRow);
  },

  async getById(id: string): Promise<UserRoutineRecord | null> {
    const db = getDb();
    const rows = await db.select().from(userRoutines).where(eq(userRoutines.id, id)).limit(1);
    const row = rows[0];
    return row ? mapRoutineRow(row) : null;
  },

  async insert(routine: UserRoutineRecord): Promise<void> {
    const db = getDb();
    await db.insert(userRoutines).values({
      id: routine.id,
      name: routine.name,
      description: routine.description,
      category: routine.category,
      frequency: routine.frequency,
      reminderTime: routine.reminderTime,
      weekdaysJson: serializeWeekdays(routine.weekdays),
      expectedDurationMin: routine.expectedDurationMin,
      customXp: routine.customXp,
      customCoins: routine.customCoins,
      templateKey: routine.templateKey,
      isArchived: routine.isArchived,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
    });

    await RoutineRepository.ensureStats(routine.id);
  },

  async update(routine: UserRoutineRecord): Promise<void> {
    const db = getDb();
    await db
      .update(userRoutines)
      .set({
        name: routine.name,
        description: routine.description,
        category: routine.category,
        frequency: routine.frequency,
        reminderTime: routine.reminderTime,
        weekdaysJson: serializeWeekdays(routine.weekdays),
        expectedDurationMin: routine.expectedDurationMin,
        customXp: routine.customXp,
        customCoins: routine.customCoins,
        templateKey: routine.templateKey,
        isArchived: routine.isArchived,
        updatedAt: routine.updatedAt,
      })
      .where(eq(userRoutines.id, routine.id));
  },

  async ensureStats(routineId: string): Promise<RoutineStatsRecord> {
    const existing = await RoutineRepository.getStats(routineId);
    if (existing) return existing;

    const stats = emptyStats(routineId);
    const db = getDb();
    await db.insert(routineStats).values({
      routineId: stats.routineId,
      totalCompleted: stats.totalCompleted,
      totalMissed: stats.totalMissed,
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      lastCompletedPeriod: stats.lastCompletedPeriod,
      updatedAt: stats.updatedAt,
    });
    return stats;
  },

  async getStats(routineId: string): Promise<RoutineStatsRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(routineStats)
      .where(eq(routineStats.routineId, routineId))
      .limit(1);
    const row = rows[0];
    return row ? mapStatsRow(row) : null;
  },

  async listStatsForRoutineIds(routineIds: string[]): Promise<RoutineStatsRecord[]> {
    if (routineIds.length === 0) return [];

    const db = getDb();
    const rows = await db
      .select()
      .from(routineStats)
      .where(inArray(routineStats.routineId, routineIds));

    return rows.map(mapStatsRow);
  },

  async saveStats(stats: RoutineStatsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(routineStats)
      .values({
        routineId: stats.routineId,
        totalCompleted: stats.totalCompleted,
        totalMissed: stats.totalMissed,
        currentStreak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        lastCompletedPeriod: stats.lastCompletedPeriod,
        updatedAt: stats.updatedAt,
      })
      .onConflictDoUpdate({
        target: routineStats.routineId,
        set: {
          totalCompleted: stats.totalCompleted,
          totalMissed: stats.totalMissed,
          currentStreak: stats.currentStreak,
          bestStreak: stats.bestStreak,
          lastCompletedPeriod: stats.lastCompletedPeriod,
          updatedAt: stats.updatedAt,
        },
      });
  },

  async listCompletionsForRoutineIdsAndPeriods(
    routineIds: string[],
    periodKeys: string[],
  ): Promise<RoutineCompletionRecord[]> {
    if (routineIds.length === 0 || periodKeys.length === 0) return [];

    const db = getDb();
    const rows = await db
      .select()
      .from(routineCompletions)
      .where(
        and(
          inArray(routineCompletions.routineId, routineIds),
          inArray(routineCompletions.periodKey, periodKeys),
        ),
      );

    return rows.map(mapCompletionRow);
  },

  async getCompletion(
    routineId: string,
    periodKey: string,
  ): Promise<RoutineCompletionRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(routineCompletions)
      .where(
        and(
          eq(routineCompletions.routineId, routineId),
          eq(routineCompletions.periodKey, periodKey),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapCompletionRow(row) : null;
  },

  async insertCompletion(completion: RoutineCompletionRecord): Promise<void> {
    const db = getDb();
    await db.insert(routineCompletions).values({
      id: completion.id,
      routineId: completion.routineId,
      periodKey: completion.periodKey,
      completedAt: completion.completedAt,
      xpAwarded: completion.xpAwarded,
      coinsAwarded: completion.coinsAwarded,
      studyPointsAwarded: completion.studyPointsAwarded,
    });
  },

  async deleteCompletion(routineId: string, periodKey: string): Promise<void> {
    const db = getDb();
    await db
      .delete(routineCompletions)
      .where(
        and(
          eq(routineCompletions.routineId, routineId),
          eq(routineCompletions.periodKey, periodKey),
        ),
      );
  },

  async countTotalCompletions(): Promise<number> {
    const db = getDb();
    const rows = await db.select({ total: count() }).from(routineCompletions);
    return Number(rows[0]?.total ?? 0);
  },
};
