import { and, eq, isNull } from 'drizzle-orm';

import type { CityPoiMission, LocalMissionTypeValue } from '@/types/city-poi-mission';

import { getDb } from '../database/client';
import { cityPoiMissions } from '../database/schema';

const mapRow = (row: typeof cityPoiMissions.$inferSelect): CityPoiMission => ({
  id: row.id,
  poiKey: row.poiKey,
  missionDate: row.missionDate,
  templateKey: row.templateKey,
  title: row.title,
  description: row.description,
  missionType: row.missionType as LocalMissionTypeValue,
  targetValue: row.targetValue,
  currentValue: row.currentValue,
  xpReward: row.xpReward,
  coinReward: row.coinReward,
  localXpReward: row.localXpReward,
  completed: row.completed,
  claimed: row.claimed,
  createdAt: row.createdAt,
  eventKey: row.eventKey ?? null,
  chainKey: row.chainKey ?? null,
  chainStep: row.chainStep ?? null,
});

export const CityPoiMissionRepository = {
  async findByDate(missionDate: string): Promise<CityPoiMission[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiMissions)
      .where(eq(cityPoiMissions.missionDate, missionDate));
    return rows.map(mapRow);
  },

  async findRoutineByPoiAndDate(poiKey: string, missionDate: string): Promise<CityPoiMission[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiMissions)
      .where(
        and(
          eq(cityPoiMissions.poiKey, poiKey),
          eq(cityPoiMissions.missionDate, missionDate),
          isNull(cityPoiMissions.eventKey),
          isNull(cityPoiMissions.chainKey),
        ),
      );
    return rows.map(mapRow);
  },

  async findByPoiAndDate(poiKey: string, missionDate: string): Promise<CityPoiMission[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiMissions)
      .where(
        and(
          eq(cityPoiMissions.poiKey, poiKey),
          eq(cityPoiMissions.missionDate, missionDate),
          isNull(cityPoiMissions.eventKey),
        ),
      );
    return rows.map(mapRow);
  },

  async findByPoiDateAndEvent(
    poiKey: string,
    missionDate: string,
    eventKey: string,
  ): Promise<CityPoiMission[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiMissions)
      .where(
        and(
          eq(cityPoiMissions.poiKey, poiKey),
          eq(cityPoiMissions.missionDate, missionDate),
          eq(cityPoiMissions.eventKey, eventKey),
        ),
      );
    return rows.map(mapRow);
  },

  async findEventMissionsByDate(eventKey: string, missionDate: string): Promise<CityPoiMission[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiMissions)
      .where(
        and(eq(cityPoiMissions.eventKey, eventKey), eq(cityPoiMissions.missionDate, missionDate)),
      );
    return rows.map(mapRow);
  },

  async findById(id: string): Promise<CityPoiMission | null> {
    const db = getDb();
    const rows = await db.select().from(cityPoiMissions).where(eq(cityPoiMissions.id, id)).limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  },

  async insert(mission: CityPoiMission): Promise<void> {
    const db = getDb();
    await db
      .insert(cityPoiMissions)
      .values({
        id: mission.id,
        poiKey: mission.poiKey,
        missionDate: mission.missionDate,
        templateKey: mission.templateKey,
        title: mission.title,
        description: mission.description,
        missionType: mission.missionType,
        targetValue: mission.targetValue,
        currentValue: mission.currentValue,
        xpReward: mission.xpReward,
        coinReward: mission.coinReward,
        localXpReward: mission.localXpReward,
        completed: mission.completed,
        claimed: mission.claimed,
        createdAt: mission.createdAt,
        eventKey: mission.eventKey,
        chainKey: mission.chainKey,
        chainStep: mission.chainStep,
      })
      .onConflictDoNothing();
  },

  async findChainMission(
    poiKey: string,
    chainKey: string,
    missionDate: string,
  ): Promise<CityPoiMission | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiMissions)
      .where(
        and(
          eq(cityPoiMissions.poiKey, poiKey),
          eq(cityPoiMissions.missionDate, missionDate),
          eq(cityPoiMissions.chainKey, chainKey),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  },

  async updateProgress(
    id: string,
    currentValue: number,
    completed: boolean,
  ): Promise<void> {
    const db = getDb();
    await db
      .update(cityPoiMissions)
      .set({ currentValue, completed })
      .where(eq(cityPoiMissions.id, id));
  },

  async markClaimed(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(cityPoiMissions)
      .set({ claimed: true, completed: true })
      .where(eq(cityPoiMissions.id, id));
  },

  async deleteByPoiAndDate(poiKey: string, missionDate: string): Promise<void> {
    const db = getDb();
    await db
      .delete(cityPoiMissions)
      .where(
        and(eq(cityPoiMissions.poiKey, poiKey), eq(cityPoiMissions.missionDate, missionDate)),
      );
  },
};
