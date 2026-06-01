import { eq } from 'drizzle-orm';

import { DEFAULT_TITLE_KEY } from '@/features/titles/constants/default-titles';
import type { TitleAnalyticsRecord } from '@/types/title';

import { getDb } from '../database/client';
import { titleAnalytics } from '../database/schema';

const DEFAULT_ANALYTICS: TitleAnalyticsRecord = {
  currentTitleKey: DEFAULT_TITLE_KEY,
  totalUnlocked: 0,
  lastPromotionAt: null,
};

const mapRow = (row: typeof titleAnalytics.$inferSelect): TitleAnalyticsRecord => ({
  currentTitleKey: row.currentTitleKey,
  totalUnlocked: row.totalUnlocked,
  lastPromotionAt: row.lastPromotionAt,
});

export const TitleAnalyticsRepository = {
  async getOrCreate(): Promise<TitleAnalyticsRecord> {
    const db = getDb();
    const rows = await db.select().from(titleAnalytics).where(eq(titleAnalytics.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(titleAnalytics).values({ id: 1, ...DEFAULT_ANALYTICS });
    return DEFAULT_ANALYTICS;
  },

  async save(record: TitleAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(titleAnalytics)
      .values({
        id: 1,
        currentTitleKey: record.currentTitleKey,
        totalUnlocked: record.totalUnlocked,
        lastPromotionAt: record.lastPromotionAt,
      })
      .onConflictDoUpdate({
        target: titleAnalytics.id,
        set: {
          currentTitleKey: record.currentTitleKey,
          totalUnlocked: record.totalUnlocked,
          lastPromotionAt: record.lastPromotionAt,
        },
      });
  },

  async recordPromotion(
    titleKey: string,
    totalUnlocked: number,
    promotedAt: string,
  ): Promise<TitleAnalyticsRecord> {
    const next: TitleAnalyticsRecord = {
      currentTitleKey: titleKey,
      totalUnlocked,
      lastPromotionAt: promotedAt,
    };

    await TitleAnalyticsRepository.save(next);
    return next;
  },
};
