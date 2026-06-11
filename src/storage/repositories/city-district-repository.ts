import { eq } from 'drizzle-orm';

import type { CityDistrictRecord } from '@/types/city-map';

import { getDb } from '../database/client';
import { cityDistricts } from '../database/schema';

const mapRow = (row: typeof cityDistricts.$inferSelect): CityDistrictRecord => ({
  districtKey: row.districtKey,
  unlockedAt: row.unlockedAt,
  unlockReason: row.unlockReason,
});

export const CityDistrictRepository = {
  async findAll(): Promise<CityDistrictRecord[]> {
    const db = getDb();
    const rows = await db.select().from(cityDistricts);
    return rows.map(mapRow);
  },

  async findByKey(districtKey: string): Promise<CityDistrictRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityDistricts)
      .where(eq(cityDistricts.districtKey, districtKey))
      .limit(1);

    const row = rows[0];
    return row ? mapRow(row) : null;
  },

  async insertMissing(records: CityDistrictRecord[]): Promise<number> {
    if (records.length === 0) return 0;

    const db = getDb();
    await db
      .insert(cityDistricts)
      .values(
        records.map((record) => ({
          districtKey: record.districtKey,
          unlockedAt: record.unlockedAt,
          unlockReason: record.unlockReason,
        })),
      )
      .onConflictDoNothing();

    return records.length;
  },

  async upsert(record: CityDistrictRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(cityDistricts)
      .values({
        districtKey: record.districtKey,
        unlockedAt: record.unlockedAt,
        unlockReason: record.unlockReason,
      })
      .onConflictDoUpdate({
        target: cityDistricts.districtKey,
        set: {
          unlockedAt: record.unlockedAt,
          unlockReason: record.unlockReason,
        },
      });
  },

  async count(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(cityDistricts);
    return rows.length;
  },
};
