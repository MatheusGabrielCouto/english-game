import { desc } from 'drizzle-orm';

import type { ShopPurchaseHistoryRecord } from '@/types/shop';

import { getDb } from '../database/client';
import { shopPurchaseHistory } from '../database/schema';

const mapRow = (row: typeof shopPurchaseHistory.$inferSelect): ShopPurchaseHistoryRecord => ({
  id: row.id,
  productKey: row.productKey,
  productName: row.productName,
  category: row.category as ShopPurchaseHistoryRecord['category'],
  quantity: row.quantity,
  pricePaid: row.pricePaid,
  purchasedAt: row.purchasedAt,
});

export const ShopPurchaseHistoryRepository = {
  async create(
    record: Omit<ShopPurchaseHistoryRecord, 'id'>,
  ): Promise<ShopPurchaseHistoryRecord> {
    const db = getDb();
    const rows = await db
      .insert(shopPurchaseHistory)
      .values({
        productKey: record.productKey,
        productName: record.productName,
        category: record.category,
        quantity: record.quantity,
        pricePaid: record.pricePaid,
        purchasedAt: record.purchasedAt,
      })
      .returning();

    return mapRow(rows[0]);
  },

  async findRecent(limit = 15): Promise<ShopPurchaseHistoryRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shopPurchaseHistory)
      .orderBy(desc(shopPurchaseHistory.purchasedAt))
      .limit(limit);

    return rows.map(mapRow);
  },
};
