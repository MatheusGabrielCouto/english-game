import { and, count, eq } from 'drizzle-orm';

import { getDb } from '../database/client';
import { dailyMissions, weeklyMissions, weeklyMissionsHistory } from '../database/schema';

export type MissionStatsSnapshot = {
  dailyCompleted: number;
  dailyTotal: number;
  weeklyCompleted: number;
  weeklyTotal: number;
};

export const MissionStatsRepository = {
  async getSnapshot(): Promise<MissionStatsSnapshot> {
    const db = getDb();

    const [dailyTotalRow] = await db.select({ total: count() }).from(dailyMissions);
    const [dailyCompletedRow] = await db
      .select({ total: count() })
      .from(dailyMissions)
      .where(eq(dailyMissions.completed, true));

    const [weeklyTotalRow] = await db.select({ total: count() }).from(weeklyMissions);
    const [weeklyHistoryTotalRow] = await db.select({ total: count() }).from(weeklyMissionsHistory);

    const [weeklyCompletedRow] = await db
      .select({ total: count() })
      .from(weeklyMissions)
      .where(and(eq(weeklyMissions.completed, true), eq(weeklyMissions.claimed, true)));

    const [weeklyHistoryCompletedRow] = await db
      .select({ total: count() })
      .from(weeklyMissionsHistory)
      .where(
        and(eq(weeklyMissionsHistory.completed, true), eq(weeklyMissionsHistory.claimed, true)),
      );

    return {
      dailyCompleted: dailyCompletedRow?.total ?? 0,
      dailyTotal: dailyTotalRow?.total ?? 0,
      weeklyCompleted: (weeklyCompletedRow?.total ?? 0) + (weeklyHistoryCompletedRow?.total ?? 0),
      weeklyTotal: (weeklyTotalRow?.total ?? 0) + (weeklyHistoryTotalRow?.total ?? 0),
    };
  },
};
