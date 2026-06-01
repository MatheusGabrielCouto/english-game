import { asc, eq } from 'drizzle-orm';

import type { ProjectSlotProgress } from '@/types/lexicon-brick';

import { getDb } from '../database/client';
import { cityPoiProjectSlotProgress } from '../database/schema';

const mapRow = (
  row: typeof cityPoiProjectSlotProgress.$inferSelect,
): ProjectSlotProgress => ({
  projectId: row.projectId,
  slotIndex: row.slotIndex,
  themeTag: row.themeTag,
  label: row.label,
  targetCount: row.targetCount,
  filledCount: row.filledCount,
});

export const CityPoiProjectSlotRepository = {
  async listForProject(projectId: string): Promise<ProjectSlotProgress[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiProjectSlotProgress)
      .where(eq(cityPoiProjectSlotProgress.projectId, projectId))
      .orderBy(asc(cityPoiProjectSlotProgress.slotIndex));

    return rows.map(mapRow);
  },

  async upsertMany(slots: ProjectSlotProgress[]): Promise<void> {
    const db = getDb();
    for (const slot of slots) {
      await db
        .insert(cityPoiProjectSlotProgress)
        .values({
          projectId: slot.projectId,
          slotIndex: slot.slotIndex,
          themeTag: slot.themeTag,
          label: slot.label,
          targetCount: slot.targetCount,
          filledCount: slot.filledCount,
        })
        .onConflictDoUpdate({
          target: [
            cityPoiProjectSlotProgress.projectId,
            cityPoiProjectSlotProgress.slotIndex,
          ],
          set: {
            filledCount: slot.filledCount,
          },
        });
    }
  },

  async incrementFilled(
    projectId: string,
    slotIndex: number,
    delta: number,
  ): Promise<void> {
    const slots = await CityPoiProjectSlotRepository.listForProject(projectId);
    const slot = slots.find((s) => s.slotIndex === slotIndex);
    if (!slot) return;

    await CityPoiProjectSlotRepository.upsertMany([
      {
        ...slot,
        filledCount: Math.min(slot.targetCount, slot.filledCount + delta),
      },
    ]);
  },
};
