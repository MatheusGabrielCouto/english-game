import { eq } from 'drizzle-orm';

import type { EpicMissionProgress } from '@/types/epic-mission';

import { getDb } from '../database/client';
import { epicMissionProgress } from '../database/schema';

const mapRow = (row: typeof epicMissionProgress.$inferSelect): EpicMissionProgress => ({
  id: row.id,
  title: row.title,
  description: row.description,
  missionType: row.missionType,
  targetValue: row.targetValue,
  currentValue: row.currentValue,
  xpReward: row.xpReward,
  coinReward: row.coinReward,
  difficulty: row.difficulty,
  status: row.status as EpicMissionProgress['status'],
  startedAt: row.startedAt,
  completedAt: row.completedAt,
});

export const EpicMissionRepository = {
  async findAll(): Promise<EpicMissionProgress[]> {
    const db = getDb();
    const rows = await db.select().from(epicMissionProgress);
    return rows.map(mapRow);
  },

  async findActive(): Promise<EpicMissionProgress[]> {
    const all = await this.findAll();
    return all.filter((mission) => mission.status === 'active');
  },

  async upsert(mission: EpicMissionProgress): Promise<void> {
    const db = getDb();
    await db
      .insert(epicMissionProgress)
      .values({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        missionType: mission.missionType,
        targetValue: mission.targetValue,
        currentValue: mission.currentValue,
        xpReward: mission.xpReward,
        coinReward: mission.coinReward,
        difficulty: mission.difficulty,
        status: mission.status,
        startedAt: mission.startedAt,
        completedAt: mission.completedAt,
      })
      .onConflictDoUpdate({
        target: epicMissionProgress.id,
        set: {
          currentValue: mission.currentValue,
          status: mission.status,
          completedAt: mission.completedAt,
        },
      });
  },

  async updateProgress(id: string, currentValue: number): Promise<void> {
    const db = getDb();
    await db
      .update(epicMissionProgress)
      .set({ currentValue })
      .where(eq(epicMissionProgress.id, id));
  },

  async patchMission(
    id: string,
    patch: Partial<
      Pick<
        EpicMissionProgress,
        'title' | 'description' | 'missionType' | 'targetValue' | 'currentValue'
      >
    >,
  ): Promise<void> {
    if (Object.keys(patch).length === 0) return

    const db = getDb();
    await db.update(epicMissionProgress).set(patch).where(eq(epicMissionProgress.id, id));
  },

  async complete(id: string, completedAt: string): Promise<void> {
    const db = getDb();
    await db
      .update(epicMissionProgress)
      .set({ status: 'completed', completedAt })
      .where(eq(epicMissionProgress.id, id));
  },
};
