import { eq } from 'drizzle-orm';

import type { CityPoiRecord, PoiCategory } from '@/types/city-map';

import { getDb } from '../database/client';
import { cityPois } from '../database/schema';

const mapRow = (row: typeof cityPois.$inferSelect): CityPoiRecord => ({
  poiKey: row.poiKey,
  districtKey: row.districtKey,
  category: row.category as PoiCategory,
  localLevel: row.localLevel,
  localXp: row.localXp,
  positionX: row.positionX,
  positionY: row.positionY,
  unlockedAt: row.unlockedAt,
  visualStage: row.visualStage,
  npcTrust: row.npcTrust,
});

export const CityPoiRepository = {
  async findAll(): Promise<CityPoiRecord[]> {
    const db = getDb();
    const rows = await db.select().from(cityPois);
    return rows.map(mapRow);
  },

  async findByKey(poiKey: string): Promise<CityPoiRecord | null> {
    const db = getDb();
    const rows = await db.select().from(cityPois).where(eq(cityPois.poiKey, poiKey)).limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  },

  async upsert(record: CityPoiRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(cityPois)
      .values({
        poiKey: record.poiKey,
        districtKey: record.districtKey,
        category: record.category,
        localLevel: record.localLevel,
        localXp: record.localXp,
        positionX: record.positionX,
        positionY: record.positionY,
        unlockedAt: record.unlockedAt,
        visualStage: record.visualStage,
        npcTrust: record.npcTrust,
      })
      .onConflictDoUpdate({
        target: cityPois.poiKey,
        set: {
          districtKey: record.districtKey,
          category: record.category,
          localLevel: record.localLevel,
          localXp: record.localXp,
          positionX: record.positionX,
          positionY: record.positionY,
          unlockedAt: record.unlockedAt,
          visualStage: record.visualStage,
          npcTrust: record.npcTrust,
        },
      });
  },

  async updateNpcTrust(poiKey: string, npcTrust: number): Promise<void> {
    const poi = await CityPoiRepository.findByKey(poiKey);
    if (!poi) return;
    await CityPoiRepository.upsert({ ...poi, npcTrust });
  },

  async count(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(cityPois);
    return rows.length;
  },
};
