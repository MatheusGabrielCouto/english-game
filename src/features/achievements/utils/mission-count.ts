import { and, eq } from 'drizzle-orm';

import { getDb } from '@/storage/database/client';
import { dailyMissions, weeklyMissions, weeklyMissionsHistory } from '@/storage/database/schema';

export const countCompletedMissions = async (): Promise<number> => {
  const db = getDb();

  const dailyRows = await db
    .select()
    .from(dailyMissions)
    .where(eq(dailyMissions.completed, true));

  const weeklyRows = await db
    .select()
    .from(weeklyMissions)
    .where(and(eq(weeklyMissions.completed, true), eq(weeklyMissions.claimed, true)));

  const weeklyHistoryRows = await db
    .select()
    .from(weeklyMissionsHistory)
    .where(and(eq(weeklyMissionsHistory.completed, true), eq(weeklyMissionsHistory.claimed, true)));

  return dailyRows.length + weeklyRows.length + weeklyHistoryRows.length;
};
