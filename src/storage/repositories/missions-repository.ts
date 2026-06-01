import { and, asc, eq } from 'drizzle-orm';

import type { Mission } from '@/types/mission';

import { getDb } from '../database/client';
import { dailyMissions } from '../database/schema';

const mapRow = (row: typeof dailyMissions.$inferSelect): Mission => ({
  id: row.id,
  title: row.title,
  description: row.description,
  xpReward: row.xpReward,
  coinReward: row.coinReward,
  completed: row.completed,
  category: row.category ?? undefined,
  difficulty: row.difficulty ?? undefined,
  templateKey: row.templateKey ?? undefined,
});

export const getMissionsByDate = async (missionsDate: string): Promise<Mission[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(dailyMissions)
    .where(eq(dailyMissions.missionsDate, missionsDate))
    .orderBy(asc(dailyMissions.id));

  return rows.map(mapRow);
};

export const replaceMissionsForDate = async (
  missionsDate: string,
  missions: Mission[],
): Promise<void> => {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.delete(dailyMissions).where(eq(dailyMissions.missionsDate, missionsDate));

    if (missions.length === 0) return;

    await tx.insert(dailyMissions).values(
      missions.map((mission) => ({
        id: mission.id,
        missionsDate,
        title: mission.title,
        description: mission.description,
        xpReward: mission.xpReward,
        coinReward: mission.coinReward,
        completed: mission.completed,
        category: mission.category ?? null,
        difficulty: mission.difficulty ?? null,
        templateKey: mission.templateKey ?? null,
      })),
    );
  });
};

export const setMissionCompleted = async (
  missionsDate: string,
  missionId: string,
  completed: boolean,
): Promise<void> => {
  const db = getDb();

  await db
    .update(dailyMissions)
    .set({ completed })
    .where(
      and(eq(dailyMissions.missionsDate, missionsDate), eq(dailyMissions.id, missionId)),
    );
};
