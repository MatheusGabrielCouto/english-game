import { desc, eq } from 'drizzle-orm';

import type { AcquisitionHistoryRecord, InventoryAnalyticsRecord } from '@/types/inventory';

import { getDb } from '../database/client';
import { inventoryAcquisitionHistory, inventoryAnalytics } from '../database/schema';

const DEFAULT_ANALYTICS: InventoryAnalyticsRecord = {
  totalItemsAcquired: 0,
  totalShieldsReceived: 0,
  totalLootBoxesReceived: 0,
  totalSpecialItemsReceived: 0,
  lastUpdatedAt: null,
};

const mapHistoryRow = (
  row: typeof inventoryAcquisitionHistory.$inferSelect,
): AcquisitionHistoryRecord => ({
  id: row.id,
  category: row.category as AcquisitionHistoryRecord['category'],
  itemKey: row.itemKey,
  quantity: row.quantity,
  message: row.message,
  source: row.source,
  acquiredAt: row.acquiredAt,
});

const mapAnalyticsRow = (
  row: typeof inventoryAnalytics.$inferSelect,
): InventoryAnalyticsRecord => ({
  totalItemsAcquired: row.totalItemsAcquired,
  totalShieldsReceived: row.totalShieldsReceived,
  totalLootBoxesReceived: row.totalLootBoxesReceived,
  totalSpecialItemsReceived: row.totalSpecialItemsReceived,
  lastUpdatedAt: row.lastUpdatedAt,
});

export const InventoryHistoryRepository = {
  async create(record: Omit<AcquisitionHistoryRecord, 'id'>): Promise<AcquisitionHistoryRecord> {
    const db = getDb();
    const rows = await db
      .insert(inventoryAcquisitionHistory)
      .values({
        category: record.category,
        itemKey: record.itemKey,
        quantity: record.quantity,
        message: record.message,
        source: record.source,
        acquiredAt: record.acquiredAt,
      })
      .returning();

    return mapHistoryRow(rows[0]);
  },

  async findRecent(limit: number): Promise<AcquisitionHistoryRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(inventoryAcquisitionHistory)
      .orderBy(desc(inventoryAcquisitionHistory.acquiredAt))
      .limit(limit);

    return rows.map(mapHistoryRow);
  },
};

export const InventoryAnalyticsRepository = {
  async getOrCreate(): Promise<InventoryAnalyticsRecord> {
    const db = getDb();
    const rows = await db
      .select()
      .from(inventoryAnalytics)
      .where(eq(inventoryAnalytics.id, 1))
      .limit(1);

    if (rows[0]) return mapAnalyticsRow(rows[0]);

    await db.insert(inventoryAnalytics).values({ id: 1, ...DEFAULT_ANALYTICS });
    return DEFAULT_ANALYTICS;
  },

  async save(record: InventoryAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(inventoryAnalytics)
      .values({
        id: 1,
        totalItemsAcquired: record.totalItemsAcquired,
        totalShieldsReceived: record.totalShieldsReceived,
        totalLootBoxesReceived: record.totalLootBoxesReceived,
        totalSpecialItemsReceived: record.totalSpecialItemsReceived,
        lastUpdatedAt: record.lastUpdatedAt,
      })
      .onConflictDoUpdate({
        target: inventoryAnalytics.id,
        set: {
          totalItemsAcquired: record.totalItemsAcquired,
          totalShieldsReceived: record.totalShieldsReceived,
          totalLootBoxesReceived: record.totalLootBoxesReceived,
          totalSpecialItemsReceived: record.totalSpecialItemsReceived,
          lastUpdatedAt: record.lastUpdatedAt,
        },
      });
  },
};
