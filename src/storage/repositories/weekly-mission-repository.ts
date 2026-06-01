import { and, asc, desc, eq } from 'drizzle-orm';

import type { WeeklyMission } from '@/types/weekly-mission';
import { isWeeklyMissionType } from '@/types/weekly-mission-type';

import { getDb } from '../database/client';
import { weeklyMissions, weeklyMissionsHistory } from '../database/schema';

const mapRow = (row: typeof weeklyMissions.$inferSelect): WeeklyMission => {
  const missionType = row.missionType;
  if (!isWeeklyMissionType(missionType)) {
    throw new Error(`Invalid weekly mission type: ${missionType}`);
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    missionType,
    targetValue: row.targetValue,
    currentValue: row.currentValue,
    xpReward: row.xpReward,
    coinReward: row.coinReward,
    completed: row.completed,
    claimed: row.claimed,
    weekStartDate: row.weekStartDate,
    weekEndDate: row.weekEndDate,
    createdAt: row.createdAt,
  };
};

const toInsertValues = (mission: WeeklyMission) => ({
  id: mission.id,
  weekStartDate: mission.weekStartDate,
  title: mission.title,
  description: mission.description,
  missionType: mission.missionType,
  targetValue: mission.targetValue,
  currentValue: mission.currentValue,
  xpReward: mission.xpReward,
  coinReward: mission.coinReward,
  completed: mission.completed,
  claimed: mission.claimed,
  weekEndDate: mission.weekEndDate,
  createdAt: mission.createdAt,
});

const create = async (mission: WeeklyMission): Promise<void> => {
  const db = getDb();
  await db.insert(weeklyMissions).values(toInsertValues(mission));
};

const update = async (mission: WeeklyMission): Promise<void> => {
  const db = getDb();

  await db
    .update(weeklyMissions)
    .set({
      title: mission.title,
      description: mission.description,
      missionType: mission.missionType,
      targetValue: mission.targetValue,
      currentValue: mission.currentValue,
      xpReward: mission.xpReward,
      coinReward: mission.coinReward,
      completed: mission.completed,
      claimed: mission.claimed,
      weekEndDate: mission.weekEndDate,
      createdAt: mission.createdAt,
    })
    .where(
      and(
        eq(weeklyMissions.id, mission.id),
        eq(weeklyMissions.weekStartDate, mission.weekStartDate),
      ),
    );
};

const findAllByWeek = async (weekStartDate: string): Promise<WeeklyMission[]> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(weeklyMissions)
    .where(eq(weeklyMissions.weekStartDate, weekStartDate))
    .orderBy(asc(weeklyMissions.id));

  return rows.map(mapRow);
};

const findById = async (
  id: string,
  weekStartDate: string,
): Promise<WeeklyMission | null> => {
  const db = getDb();
  const rows = await db
    .select()
    .from(weeklyMissions)
    .where(and(eq(weeklyMissions.id, id), eq(weeklyMissions.weekStartDate, weekStartDate)))
    .limit(1);

  return rows[0] ? mapRow(rows[0]) : null;
};

const claim = async (id: string, weekStartDate: string): Promise<void> => {
  const db = getDb();

  await db
    .update(weeklyMissions)
    .set({ claimed: true })
    .where(and(eq(weeklyMissions.id, id), eq(weeklyMissions.weekStartDate, weekStartDate)));
};

const archiveWeek = async (weekStartDate: string): Promise<void> => {
  const db = getDb();
  const archivedAt = new Date().toISOString();

  await db.transaction(async (tx) => {
    const rows = await tx
      .select()
      .from(weeklyMissions)
      .where(eq(weeklyMissions.weekStartDate, weekStartDate));

    if (rows.length > 0) {
      await tx.insert(weeklyMissionsHistory).values(
        rows.map((row) => ({
          id: row.id,
          weekStartDate: row.weekStartDate,
          title: row.title,
          description: row.description,
          missionType: row.missionType,
          targetValue: row.targetValue,
          currentValue: row.currentValue,
          xpReward: row.xpReward,
          coinReward: row.coinReward,
          completed: row.completed,
          claimed: row.claimed,
          weekEndDate: row.weekEndDate,
          createdAt: row.createdAt,
          archivedAt,
        })),
      );
    }

    await tx.delete(weeklyMissions).where(eq(weeklyMissions.weekStartDate, weekStartDate));
  });
};

const findHistory = async (limit = 50) => {
  const db = getDb();
  return db
    .select()
    .from(weeklyMissionsHistory)
    .orderBy(desc(weeklyMissionsHistory.archivedAt))
    .limit(limit);
};

const deleteByWeek = async (weekStartDate: string): Promise<void> => {
  const db = getDb();
  await db.delete(weeklyMissions).where(eq(weeklyMissions.weekStartDate, weekStartDate));
};

export const WeeklyMissionRepository = {
  create,
  update,
  findAll: findAllByWeek,
  findAllByWeek,
  findById,
  claim,
  archiveWeek,
  findHistory,
  deleteByWeek,
};
