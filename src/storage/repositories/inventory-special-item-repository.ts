import { desc, eq } from 'drizzle-orm';

import type { SpecialItemRecord } from '@/types/inventory';

import { getDb } from '../database/client';
import { inventorySpecialItems } from '../database/schema';

const mapRow = (row: typeof inventorySpecialItems.$inferSelect): SpecialItemRecord => ({
  id: row.id,
  itemKey: row.itemKey,
  quantity: row.quantity,
  source: row.source,
  acquiredAt: row.acquiredAt,
});

export const InventorySpecialItemRepository = {
  async findAll(): Promise<SpecialItemRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(inventorySpecialItems)
      .orderBy(desc(inventorySpecialItems.acquiredAt));

    return rows.map(mapRow);
  },

  async findByItemKey(itemKey: string): Promise<SpecialItemRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(inventorySpecialItems)
      .where(eq(inventorySpecialItems.itemKey, itemKey))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async upsert(itemKey: string, quantity: number, source: string): Promise<SpecialItemRecord> {
    const existing = await InventorySpecialItemRepository.findByItemKey(itemKey);
    if (existing) {
      const db = getDb();
      const rows = await db
        .update(inventorySpecialItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(inventorySpecialItems.id, existing.id))
        .returning();

      return mapRow(rows[0]);
    }

    return InventorySpecialItemRepository.create(itemKey, quantity, source);
  },

  async create(itemKey: string, quantity: number, source: string): Promise<SpecialItemRecord> {
    const db = getDb();
    const rows = await db
      .insert(inventorySpecialItems)
      .values({
        itemKey,
        quantity,
        source,
        acquiredAt: new Date().toISOString(),
      })
      .returning();

    return mapRow(rows[0]);
  },

  async consumeOne(itemKey: string): Promise<boolean> {
    const existing = await InventorySpecialItemRepository.findByItemKey(itemKey);
    if (!existing || existing.quantity < 1) return false;

    const db = getDb();

    if (existing.quantity === 1) {
      await db.delete(inventorySpecialItems).where(eq(inventorySpecialItems.id, existing.id));
      return true;
    }

    await db
      .update(inventorySpecialItems)
      .set({ quantity: existing.quantity - 1 })
      .where(eq(inventorySpecialItems.id, existing.id));

    return true;
  },
};
