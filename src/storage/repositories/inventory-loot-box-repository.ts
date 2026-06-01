import { and, desc, eq } from 'drizzle-orm';

import type { LootBoxRecord, LootBoxRarityValue } from '@/types/inventory';

import { getDb } from '../database/client';
import { inventoryLootBoxes } from '../database/schema';

const mapRow = (row: typeof inventoryLootBoxes.$inferSelect): LootBoxRecord => ({
  id: row.id,
  rarity: row.rarity as LootBoxRecord['rarity'],
  source: row.source,
  acquiredAt: row.acquiredAt,
  opened: row.opened,
});

export const InventoryLootBoxRepository = {
  async create(rarity: LootBoxRecord['rarity'], source: string): Promise<LootBoxRecord> {
    const db = getDb();
    const acquiredAt = new Date().toISOString();
    const rows = await db
      .insert(inventoryLootBoxes)
      .values({ rarity, source, acquiredAt, opened: false })
      .returning();

    return mapRow(rows[0]);
  },

  async findById(id: number): Promise<LootBoxRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(inventoryLootBoxes)
      .where(eq(inventoryLootBoxes.id, id))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findUnopened(): Promise<LootBoxRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(inventoryLootBoxes)
      .where(eq(inventoryLootBoxes.opened, false))
      .orderBy(desc(inventoryLootBoxes.acquiredAt));

    return rows.map(mapRow);
  },

  async findFirstUnopenedByRarity(rarity: LootBoxRarityValue): Promise<LootBoxRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(inventoryLootBoxes)
      .where(and(eq(inventoryLootBoxes.opened, false), eq(inventoryLootBoxes.rarity, rarity)))
      .orderBy(desc(inventoryLootBoxes.acquiredAt))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async deleteById(id: number): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .delete(inventoryLootBoxes)
      .where(and(eq(inventoryLootBoxes.id, id), eq(inventoryLootBoxes.opened, false)))
      .returning({ id: inventoryLootBoxes.id });

    return rows.length > 0;
  },

  async markOpened(id: number): Promise<void> {
    const db = getDb();
    await db
      .update(inventoryLootBoxes)
      .set({ opened: true })
      .where(and(eq(inventoryLootBoxes.id, id), eq(inventoryLootBoxes.opened, false)));
  },

  async countUnopened(): Promise<number> {
    const boxes = await InventoryLootBoxRepository.findUnopened();
    return boxes.length;
  },
};
