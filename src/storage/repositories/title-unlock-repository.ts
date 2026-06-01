import { eq } from 'drizzle-orm';

import type { TitleUnlockRecord } from '@/types/title';

import { getDb } from '../database/client';
import { titleUnlocks } from '../database/schema';

const mapRow = (row: typeof titleUnlocks.$inferSelect): TitleUnlockRecord => ({
  titleKey: row.titleKey,
  unlockedAt: row.unlockedAt,
  levelAtUnlock: row.levelAtUnlock,
});

export const TitleUnlockRepository = {
  async findAll(): Promise<TitleUnlockRecord[]> {
    const db = getDb();
    const rows = await db.select().from(titleUnlocks);
    return rows.map(mapRow);
  },

  async findByKey(key: string): Promise<TitleUnlockRecord | null> {
    const db = getDb();
    const rows = await db.select().from(titleUnlocks).where(eq(titleUnlocks.titleKey, key)).limit(1);

    if (!rows[0]) return null;

    return mapRow(rows[0]);
  },

  async create(record: TitleUnlockRecord): Promise<void> {
    const db = getDb();
    await db.insert(titleUnlocks).values({
      titleKey: record.titleKey,
      unlockedAt: record.unlockedAt,
      levelAtUnlock: record.levelAtUnlock,
    });
  },
};
