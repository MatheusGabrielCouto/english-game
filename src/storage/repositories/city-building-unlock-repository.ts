import { eq } from 'drizzle-orm';

import type { CityBuildingUnlockRecord } from '@/types/city';

import { getDb } from '../database/client';
import { cityBuildingUnlocks } from '../database/schema';

const mapRow = (row: typeof cityBuildingUnlocks.$inferSelect): CityBuildingUnlockRecord => ({
  buildingKey: row.buildingKey,
  unlockedAt: row.unlockedAt,
  levelAtUnlock: row.levelAtUnlock,
});

export const CityBuildingUnlockRepository = {
  async findAll(): Promise<CityBuildingUnlockRecord[]> {
    const db = getDb();
    const rows = await db.select().from(cityBuildingUnlocks);
    return rows.map(mapRow);
  },

  async create(record: CityBuildingUnlockRecord): Promise<void> {
    const db = getDb();
    await db.insert(cityBuildingUnlocks).values({
      buildingKey: record.buildingKey,
      unlockedAt: record.unlockedAt,
      levelAtUnlock: record.levelAtUnlock,
    });
  },
};
