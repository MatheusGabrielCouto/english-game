import { gt, lte } from 'drizzle-orm';

import { getDb } from '../database/client';
import { activeBoosters } from '../database/schema';

export type ActiveBoosterRecord = {
  id: number;
  boosterKey: string;
  multiplier: number;
  expiresAt: string;
  source: string;
};

const mapRow = (row: typeof activeBoosters.$inferSelect): ActiveBoosterRecord => ({
  id: row.id,
  boosterKey: row.boosterKey,
  multiplier: row.multiplier,
  expiresAt: row.expiresAt,
  source: row.source,
});

export const ActiveBoosterRepository = {
  async findActive(nowIso = new Date().toISOString()): Promise<ActiveBoosterRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(activeBoosters)
      .where(gt(activeBoosters.expiresAt, nowIso));

    return rows.map(mapRow);
  },

  async deleteExpired(nowIso = new Date().toISOString()): Promise<void> {
    const db = getDb();
    await db.delete(activeBoosters).where(lte(activeBoosters.expiresAt, nowIso));
  },

  async create(params: {
    boosterKey: string;
    multiplier: number;
    expiresAt: string;
    source: string;
  }): Promise<ActiveBoosterRecord> {
    const db = getDb();
    const rows = await db
      .insert(activeBoosters)
      .values({
        boosterKey: params.boosterKey,
        multiplier: params.multiplier,
        expiresAt: params.expiresAt,
        source: params.source,
      })
      .returning();

    return mapRow(rows[0]);
  },
};
