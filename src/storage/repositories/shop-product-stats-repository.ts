import { desc, eq } from 'drizzle-orm';

import type { ShopCategoryValue, ShopProductStatsRecord } from '@/types/shop';

import { getDb } from '../database/client';
import { shopProductStats } from '../database/schema';

const mapRow = (row: typeof shopProductStats.$inferSelect): ShopProductStatsRecord => ({
  productKey: row.productKey,
  category: row.category as ShopCategoryValue,
  purchaseCount: row.purchaseCount,
  coinsSpent: row.coinsSpent,
});

export const ShopProductStatsRepository = {
  async findAll(): Promise<ShopProductStatsRecord[]> {
    const db = getDb();
    const rows = await db.select().from(shopProductStats);
    return rows.map(mapRow);
  },

  async findTopProduct(): Promise<ShopProductStatsRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shopProductStats)
      .orderBy(desc(shopProductStats.purchaseCount))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async findTopCategory(): Promise<{ category: ShopCategoryValue; purchaseCount: number } | null> {
    const stats = await ShopProductStatsRepository.findAll();
    if (stats.length === 0) return null;

    const categoryTotals = new Map<ShopCategoryValue, number>();

    stats.forEach((entry) => {
      categoryTotals.set(entry.category, (categoryTotals.get(entry.category) ?? 0) + entry.purchaseCount);
    });

    let topCategory: ShopCategoryValue | null = null;
    let topCount = 0;

    categoryTotals.forEach((count, category) => {
      if (count > topCount) {
        topCount = count;
        topCategory = category;
      }
    });

    if (!topCategory) return null;

    return { category: topCategory, purchaseCount: topCount };
  },

  async recordPurchase(
    productKey: string,
    category: ShopCategoryValue,
    pricePaid: number,
  ): Promise<void> {
    const db = getDb();
    const existing = await db
      .select()
      .from(shopProductStats)
      .where(eq(shopProductStats.productKey, productKey))
      .limit(1);

    if (existing[0]) {
      await db
        .update(shopProductStats)
        .set({
          purchaseCount: existing[0].purchaseCount + 1,
          coinsSpent: existing[0].coinsSpent + pricePaid,
        })
        .where(eq(shopProductStats.productKey, productKey));
      return;
    }

    await db.insert(shopProductStats).values({
      productKey,
      category,
      purchaseCount: 1,
      coinsSpent: pricePaid,
    });
  },
};
