import { eq } from 'drizzle-orm';

import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';
import type { LootBoxAnalyticsRecord } from '@/types/loot-box';

import { getDb } from '../database/client';
import { lootBoxAnalytics } from '../database/schema';

const DEFAULT_ANALYTICS: LootBoxAnalyticsRecord = {
  totalReceived: 0,
  totalOpened: 0,
  totalCoinsFromBoxes: 0,
  totalShieldsFromBoxes: 0,
  biggestCoinReward: 0,
  openedCommon: 0,
  openedRare: 0,
  openedEpic: 0,
  openedLegendary: 0,
};

const mapRow = (row: typeof lootBoxAnalytics.$inferSelect): LootBoxAnalyticsRecord => ({
  totalReceived: row.totalReceived,
  totalOpened: row.totalOpened,
  totalCoinsFromBoxes: row.totalCoinsFromBoxes,
  totalShieldsFromBoxes: row.totalShieldsFromBoxes,
  biggestCoinReward: row.biggestCoinReward,
  openedCommon: row.openedCommon,
  openedRare: row.openedRare,
  openedEpic: row.openedEpic,
  openedLegendary: row.openedLegendary,
});

const rarityOpenedKey = (
  rarity: LootBoxRarityValue,
): keyof Pick<
  LootBoxAnalyticsRecord,
  'openedCommon' | 'openedRare' | 'openedEpic' | 'openedLegendary'
> => {
  switch (rarity) {
    case LootBoxRarity.RARE:
      return 'openedRare';
    case LootBoxRarity.EPIC:
      return 'openedEpic';
    case LootBoxRarity.LEGENDARY:
      return 'openedLegendary';
    default:
      return 'openedCommon';
  }
};

export const LootBoxAnalyticsRepository = {
  async getOrCreate(): Promise<LootBoxAnalyticsRecord> {
    const db = getDb();
    const rows = await db.select().from(lootBoxAnalytics).where(eq(lootBoxAnalytics.id, 1)).limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(lootBoxAnalytics).values({ id: 1, ...DEFAULT_ANALYTICS });
    return DEFAULT_ANALYTICS;
  },

  async save(record: LootBoxAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(lootBoxAnalytics)
      .values({
        id: 1,
        totalReceived: record.totalReceived,
        totalOpened: record.totalOpened,
        totalCoinsFromBoxes: record.totalCoinsFromBoxes,
        totalShieldsFromBoxes: record.totalShieldsFromBoxes,
        biggestCoinReward: record.biggestCoinReward,
        openedCommon: record.openedCommon,
        openedRare: record.openedRare,
        openedEpic: record.openedEpic,
        openedLegendary: record.openedLegendary,
      })
      .onConflictDoUpdate({
        target: lootBoxAnalytics.id,
        set: {
          totalReceived: record.totalReceived,
          totalOpened: record.totalOpened,
          totalCoinsFromBoxes: record.totalCoinsFromBoxes,
          totalShieldsFromBoxes: record.totalShieldsFromBoxes,
          biggestCoinReward: record.biggestCoinReward,
          openedCommon: record.openedCommon,
          openedRare: record.openedRare,
          openedEpic: record.openedEpic,
          openedLegendary: record.openedLegendary,
        },
      });
  },

  async incrementReceived(amount = 1): Promise<void> {
    const analytics = await LootBoxAnalyticsRepository.getOrCreate();
    await LootBoxAnalyticsRepository.save({
      ...analytics,
      totalReceived: analytics.totalReceived + amount,
    });
  },

  async recordOpened(
    boxRarity: LootBoxRarityValue,
    reward: { type: string; amount: number },
  ): Promise<void> {
    const analytics = await LootBoxAnalyticsRepository.getOrCreate();
    const openedKey = rarityOpenedKey(boxRarity);

    const next: LootBoxAnalyticsRecord = {
      ...analytics,
      totalOpened: analytics.totalOpened + 1,
      [openedKey]: analytics[openedKey] + 1,
    };

    if (reward.type === 'coins') {
      next.totalCoinsFromBoxes = analytics.totalCoinsFromBoxes + reward.amount;
      next.biggestCoinReward = Math.max(analytics.biggestCoinReward, reward.amount);
    }

    if (reward.type === 'shield') {
      next.totalShieldsFromBoxes = analytics.totalShieldsFromBoxes + reward.amount;
    }

    await LootBoxAnalyticsRepository.save(next);
  },

  rarityOpenedKey,
};
