import { desc, eq } from 'drizzle-orm';

import type { LootBoxOpenHistoryRecord } from '@/types/loot-box';

import { getDb } from '../database/client';
import { lootBoxOpenHistory } from '../database/schema';

const mapRow = (row: typeof lootBoxOpenHistory.$inferSelect): LootBoxOpenHistoryRecord => ({
  id: row.id,
  lootBoxId: row.lootBoxId,
  boxRarity: row.boxRarity as LootBoxOpenHistoryRecord['boxRarity'],
  rewardType: row.rewardType as LootBoxOpenHistoryRecord['rewardType'],
  rewardAmount: row.rewardAmount,
  rewardLabel: row.rewardLabel,
  rewardRarity: row.rewardRarity as LootBoxOpenHistoryRecord['rewardRarity'],
  rewardItemKey: row.rewardItemKey,
  openedAt: row.openedAt,
});

export const LootBoxOpenHistoryRepository = {
  async create(
    record: Omit<LootBoxOpenHistoryRecord, 'id'>,
  ): Promise<LootBoxOpenHistoryRecord> {
    const db = getDb();
    const rows = await db
      .insert(lootBoxOpenHistory)
      .values({
        lootBoxId: record.lootBoxId,
        boxRarity: record.boxRarity,
        rewardType: record.rewardType,
        rewardAmount: record.rewardAmount,
        rewardLabel: record.rewardLabel,
        rewardRarity: record.rewardRarity,
        rewardItemKey: record.rewardItemKey,
        openedAt: record.openedAt,
      })
      .returning();

    return mapRow(rows[0]);
  },

  async findRecent(limit: number): Promise<LootBoxOpenHistoryRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lootBoxOpenHistory)
      .orderBy(desc(lootBoxOpenHistory.openedAt))
      .limit(limit);

    return rows.map(mapRow);
  },
};
