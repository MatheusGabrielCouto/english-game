import { and, eq } from 'drizzle-orm';

import type { ShopStockSlotRecord } from '@/types/shop-stock';

import { getDb } from '../database/client';
import { shopStockSlots } from '../database/schema';

const mapRow = (row: typeof shopStockSlots.$inferSelect): ShopStockSlotRecord => ({
  storageKey: row.storageKey,
  periodType: row.periodType as ShopStockSlotRecord['periodType'],
  periodKey: row.periodKey,
  shopKind: row.shopKind as ShopStockSlotRecord['shopKind'],
  catalogStockId: row.catalogStockId,
  productKey: row.productKey,
  maxStock: row.maxStock,
  stockRemaining: row.stockRemaining,
  createdAt: row.createdAt,
});

export const ShopStockRepository = {
  async findByStorageKey(storageKey: string): Promise<ShopStockSlotRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shopStockSlots)
      .where(eq(shopStockSlots.storageKey, storageKey))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findByPeriod(
    periodKey: string,
    periodType: ShopStockSlotRecord['periodType'],
    shopKind: ShopStockSlotRecord['shopKind'],
  ): Promise<ShopStockSlotRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shopStockSlots)
      .where(
        and(
          eq(shopStockSlots.periodKey, periodKey),
          eq(shopStockSlots.periodType, periodType),
          eq(shopStockSlots.shopKind, shopKind),
        ),
      );

    return rows.map(mapRow);
  },

  async saveSlots(
    slots: Omit<ShopStockSlotRecord, 'createdAt'>[],
  ): Promise<ShopStockSlotRecord[]> {
    if (slots.length === 0) return [];

    const db = getDb();
    const createdAt = new Date().toISOString();

    const rows = await db
      .insert(shopStockSlots)
      .values(
        slots.map((slot) => ({
          storageKey: slot.storageKey,
          periodType: slot.periodType,
          periodKey: slot.periodKey,
          shopKind: slot.shopKind,
          catalogStockId: slot.catalogStockId,
          productKey: slot.productKey,
          maxStock: slot.maxStock,
          stockRemaining: slot.stockRemaining,
          createdAt,
        })),
      )
      .onConflictDoNothing()
      .returning();

    return rows.map(mapRow);
  },

  async decrementStock(storageKey: string): Promise<ShopStockSlotRecord | null> {
    const db = getDb();
    const existing = await ShopStockRepository.findByStorageKey(storageKey);
    if (!existing || existing.stockRemaining <= 0) return null;

    const rows = await db
      .update(shopStockSlots)
      .set({ stockRemaining: existing.stockRemaining - 1 })
      .where(eq(shopStockSlots.storageKey, storageKey))
      .returning();

    return rows[0] ? mapRow(rows[0]) : null;
  },
};
