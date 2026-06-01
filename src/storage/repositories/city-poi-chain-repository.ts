import { and, eq } from 'drizzle-orm';

import type { PoiChainProgressRecord } from '@/types/city-poi-chain';

import { getDb } from '../database/client';
import { cityPoiChainProgress } from '../database/schema';

const mapRow = (row: typeof cityPoiChainProgress.$inferSelect): PoiChainProgressRecord => ({
  poiKey: row.poiKey,
  chainKey: row.chainKey,
  currentStep: row.currentStep,
  completed: row.completed,
  updatedAt: row.updatedAt,
});

export const CityPoiChainRepository = {
  async findByPoi(poiKey: string): Promise<PoiChainProgressRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiChainProgress)
      .where(eq(cityPoiChainProgress.poiKey, poiKey));
    return rows.map(mapRow);
  },

  async findOne(poiKey: string, chainKey: string): Promise<PoiChainProgressRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityPoiChainProgress)
      .where(
        and(
          eq(cityPoiChainProgress.poiKey, poiKey),
          eq(cityPoiChainProgress.chainKey, chainKey),
        ),
      )
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  },

  async upsert(record: PoiChainProgressRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(cityPoiChainProgress)
      .values({
        poiKey: record.poiKey,
        chainKey: record.chainKey,
        currentStep: record.currentStep,
        completed: record.completed,
        updatedAt: record.updatedAt,
      })
      .onConflictDoUpdate({
        target: [cityPoiChainProgress.poiKey, cityPoiChainProgress.chainKey],
        set: {
          currentStep: record.currentStep,
          completed: record.completed,
          updatedAt: record.updatedAt,
        },
      });
  },
};
