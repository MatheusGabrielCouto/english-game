import { desc } from 'drizzle-orm';

import type { ShieldUsageRecord } from '@/types/shield';

import { getDb } from '../database/client';
import { shieldUsageHistory } from '../database/schema';

const mapRow = (row: typeof shieldUsageHistory.$inferSelect): ShieldUsageRecord => ({
  id: row.id,
  usedAt: row.usedAt,
  missedDate: row.missedDate,
  streakProtected: row.streakProtected,
  shieldsRemaining: row.shieldsRemaining,
});

export const ShieldUsageRepository = {
  async create(record: Omit<ShieldUsageRecord, 'id'>): Promise<ShieldUsageRecord> {
    const db = getDb();
    const rows = await db
      .insert(shieldUsageHistory)
      .values({
        usedAt: record.usedAt,
        missedDate: record.missedDate,
        streakProtected: record.streakProtected,
        shieldsRemaining: record.shieldsRemaining,
      })
      .returning();

    return mapRow(rows[0]);
  },

  async findRecent(limit: number): Promise<ShieldUsageRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shieldUsageHistory)
      .orderBy(desc(shieldUsageHistory.usedAt))
      .limit(limit);

    return rows.map(mapRow);
  },
};
