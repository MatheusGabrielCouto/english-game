import { desc } from 'drizzle-orm';

import { farmSessions } from '@/storage/database/schema';
import type { FarmDailyStats, FarmSessionRecord } from '@/types/farm';

import { getDb } from '../database/client';

export const recordFarmSession = async (session: Omit<FarmSessionRecord, 'id'>): Promise<void> => {
  const db = getDb();
  await db.insert(farmSessions).values({
    activityType: session.activityType,
    amount: session.amount,
    studyPointsEarned: session.studyPointsEarned,
    coinsEarned: session.coinsEarned,
    recordedAt: session.recordedAt,
  });
};

export const getRecentFarmSessions = async (limit = 15): Promise<FarmSessionRecord[]> => {
  const db = getDb();
  const rows = await db.select().from(farmSessions).orderBy(desc(farmSessions.id)).limit(limit);
  return rows.map((row) => ({
    id: row.id,
    activityType: row.activityType as FarmSessionRecord['activityType'],
    amount: row.amount,
    studyPointsEarned: row.studyPointsEarned,
    coinsEarned: row.coinsEarned,
    recordedAt: row.recordedAt,
  }));
};

export const getFarmStatsSince = async (sinceIso: string): Promise<FarmDailyStats[]> => {
  const db = getDb();
  const rows = await db.select().from(farmSessions);
  const filtered = rows.filter((row) => row.recordedAt >= sinceIso);

  const map = new Map<string, FarmDailyStats>();
  for (const row of filtered) {
    const key = row.activityType;
    const current = map.get(key) ?? {
      activityType: row.activityType as FarmDailyStats['activityType'],
      totalAmount: 0,
      totalStudyPoints: 0,
      sessionsCount: 0,
    };
    current.totalAmount += row.amount;
    current.totalStudyPoints += row.studyPointsEarned;
    current.sessionsCount += 1;
    map.set(key, current);
  }

  return [...map.values()];
};

export const getTodayFarmStudyPoints = async (dayStartIso: string): Promise<number> => {
  const db = getDb();
  const rows = await db.select().from(farmSessions);
  return rows
    .filter((row) => row.recordedAt >= dayStartIso)
    .reduce((sum, row) => sum + row.studyPointsEarned, 0);
};

export const getTodayFarmCoins = async (dayStartIso: string): Promise<number> => {
  const db = getDb();
  const rows = await db.select().from(farmSessions);
  return rows
    .filter((row) => row.recordedAt >= dayStartIso)
    .reduce((sum, row) => sum + row.coinsEarned, 0);
};
