import { count, sql } from 'drizzle-orm';

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

    const [dailyRow, weeklyRow, weeklyHistoryRow] = await Promise.all([
      db
        .select({
          total: count(),
          completed: sql<number>`sum(case when ${dailyMissions.completed} then 1 else 0 end)`,
        })
        .from(dailyMissions),
      db
        .select({
          total: count(),
          completed: sql<number>`sum(case when ${weeklyMissions.completed} = 1 and ${weeklyMissions.claimed} = 1 then 1 else 0 end)`,
        })
        .from(weeklyMissions),
      db
        .select({
          total: count(),
          completed: sql<number>`sum(case when ${weeklyMissionsHistory.completed} = 1 and ${weeklyMissionsHistory.claimed} = 1 then 1 else 0 end)`,
        })
        .from(weeklyMissionsHistory),
    ]);

    return {
      dailyCompleted: Number(dailyRow[0]?.completed ?? 0),
      dailyTotal: Number(dailyRow[0]?.total ?? 0),
      weeklyCompleted:
        Number(weeklyRow[0]?.completed ?? 0) + Number(weeklyHistoryRow[0]?.completed ?? 0),
      weeklyTotal: Number(weeklyRow[0]?.total ?? 0) + Number(weeklyHistoryRow[0]?.total ?? 0),
    };
  },
};
