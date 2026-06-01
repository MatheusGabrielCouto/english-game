import { eq } from 'drizzle-orm';

import type { ShopAnalyticsRecord } from '@/types/shop';

import { getDb } from '../database/client';
import { shopAnalytics } from '../database/schema';

const DEFAULT_ANALYTICS: ShopAnalyticsRecord = {
  totalCoinsSpent: 0,
  totalPurchases: 0,
  totalItemsAcquired: 0,
  shieldsPurchased: 0,
  lootBoxesPurchased: 0,
  lastPurchaseAt: null,
};

const mapRow = (row: typeof shopAnalytics.$inferSelect): ShopAnalyticsRecord => ({
  totalCoinsSpent: row.totalCoinsSpent,
  totalPurchases: row.totalPurchases,
  totalItemsAcquired: row.totalItemsAcquired,
  shieldsPurchased: row.shieldsPurchased,
  lootBoxesPurchased: row.lootBoxesPurchased,
  lastPurchaseAt: row.lastPurchaseAt,
});

export const ShopAnalyticsRepository = {
  async getOrCreate(): Promise<ShopAnalyticsRecord> {
    const db = getDb();
    const rows = await db.select().from(shopAnalytics).where(eq(shopAnalytics.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(shopAnalytics).values({ id: 1, ...DEFAULT_ANALYTICS });
    return DEFAULT_ANALYTICS;
  },

  async save(record: ShopAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(shopAnalytics)
      .values({
        id: 1,
        totalCoinsSpent: record.totalCoinsSpent,
        totalPurchases: record.totalPurchases,
        totalItemsAcquired: record.totalItemsAcquired,
        shieldsPurchased: record.shieldsPurchased,
        lootBoxesPurchased: record.lootBoxesPurchased,
        lastPurchaseAt: record.lastPurchaseAt,
      })
      .onConflictDoUpdate({
        target: shopAnalytics.id,
        set: {
          totalCoinsSpent: record.totalCoinsSpent,
          totalPurchases: record.totalPurchases,
          totalItemsAcquired: record.totalItemsAcquired,
          shieldsPurchased: record.shieldsPurchased,
          lootBoxesPurchased: record.lootBoxesPurchased,
          lastPurchaseAt: record.lastPurchaseAt,
        },
      });
  },

  async recordPurchase(params: {
    pricePaid: number;
    quantity: number;
    shieldsPurchased: number;
    lootBoxesPurchased: number;
    purchasedAt: string;
  }): Promise<ShopAnalyticsRecord> {
    const analytics = await ShopAnalyticsRepository.getOrCreate();

    const next: ShopAnalyticsRecord = {
      totalCoinsSpent: analytics.totalCoinsSpent + params.pricePaid,
      totalPurchases: analytics.totalPurchases + 1,
      totalItemsAcquired: analytics.totalItemsAcquired + params.quantity,
      shieldsPurchased: analytics.shieldsPurchased + params.shieldsPurchased,
      lootBoxesPurchased: analytics.lootBoxesPurchased + params.lootBoxesPurchased,
      lastPurchaseAt: params.purchasedAt,
    };

    await ShopAnalyticsRepository.save(next);
    return next;
  },
};
