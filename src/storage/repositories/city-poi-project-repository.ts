import { and, eq, isNotNull, isNull } from 'drizzle-orm';

import type { CityPoiProjectRecord } from '@/types/city-resource';

import { getDb } from '../database/client';
import { cityPoiProjects } from '../database/schema';

const mapRow = (row: typeof cityPoiProjects.$inferSelect): CityPoiProjectRecord => ({
  id: row.id,
  poiKey: row.poiKey,
  projectKey: row.projectKey,
  weekStartDate: row.weekStartDate,
  title: row.title,
  description: row.description,
  resourceType: row.resourceType as CityPoiProjectRecord['resourceType'],
  targetTotal: row.targetTotal,
  deliveryChunk: row.deliveryChunk,
  progress: row.progress,
  localXpOnComplete: row.localXpOnComplete,
  vitalityOnComplete: row.vitalityOnComplete,
  completedAt: row.completedAt,
  createdAt: row.createdAt,
});

export const CityPoiProjectRepository = {
  async findActiveForPoi(
    poiKey: string,
    weekStartDate: string,
  ): Promise<CityPoiProjectRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiProjects)
      .where(
        and(
          eq(cityPoiProjects.poiKey, poiKey),
          eq(cityPoiProjects.weekStartDate, weekStartDate),
          isNull(cityPoiProjects.completedAt),
        ),
      )
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async hasCompletedProjectKey(projectKey: string): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiProjects)
      .where(
        and(
          eq(cityPoiProjects.projectKey, projectKey),
          isNotNull(cityPoiProjects.completedAt),
        ),
      )
      .limit(1);

    return rows.length > 0;
  },

  async upsert(record: CityPoiProjectRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(cityPoiProjects)
      .values({
        id: record.id,
        poiKey: record.poiKey,
        projectKey: record.projectKey,
        weekStartDate: record.weekStartDate,
        title: record.title,
        description: record.description,
        resourceType: record.resourceType,
        targetTotal: record.targetTotal,
        deliveryChunk: record.deliveryChunk,
        progress: record.progress,
        localXpOnComplete: record.localXpOnComplete,
        vitalityOnComplete: record.vitalityOnComplete,
        completedAt: record.completedAt,
        createdAt: record.createdAt,
      })
      .onConflictDoUpdate({
        target: cityPoiProjects.id,
        set: {
          progress: record.progress,
          completedAt: record.completedAt,
        },
      });
  },
};
