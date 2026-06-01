import { eq } from 'drizzle-orm';

import type { AchievementAnalyticsRecord, AchievementReward } from '@/types/achievement';
import { AchievementRewardType } from '@/types/achievement';

import { getDb } from '../database/client';
import { achievementAnalytics } from '../database/schema';

const DEFAULT_ANALYTICS: AchievementAnalyticsRecord = {
  totalUnlocked: 0,
  totalCoinsGranted: 0,
  totalShieldsGranted: 0,
  totalLootBoxesGranted: 0,
  lastUnlockAt: null,
};

const mapRow = (row: typeof achievementAnalytics.$inferSelect): AchievementAnalyticsRecord => ({
  totalUnlocked: row.totalUnlocked,
  totalCoinsGranted: row.totalCoinsGranted,
  totalShieldsGranted: row.totalShieldsGranted,
  totalLootBoxesGranted: row.totalLootBoxesGranted,
  lastUnlockAt: row.lastUnlockAt,
});

const sumRewards = (rewards: AchievementReward[]) => {
  let coins = 0;
  let shields = 0;
  let lootBoxes = 0;

  rewards.forEach((reward) => {
    switch (reward.type) {
      case AchievementRewardType.COINS:
        coins += reward.amount;
        break;
      case AchievementRewardType.SHIELD:
        shields += reward.amount;
        break;
      case AchievementRewardType.LOOT_BOX:
        lootBoxes += 1;
        break;
      default:
        break;
    }
  });

  return { coins, shields, lootBoxes };
};

export const AchievementAnalyticsRepository = {
  async getOrCreate(): Promise<AchievementAnalyticsRecord> {
    const db = getDb();
    const rows = await db
      .select()
      .from(achievementAnalytics)
      .where(eq(achievementAnalytics.id, 1))
      .limit(1);

    if (rows[0]) return mapRow(rows[0]);

    await db.insert(achievementAnalytics).values({ id: 1, ...DEFAULT_ANALYTICS });
    return DEFAULT_ANALYTICS;
  },

  async save(record: AchievementAnalyticsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(achievementAnalytics)
      .values({
        id: 1,
        totalUnlocked: record.totalUnlocked,
        totalCoinsGranted: record.totalCoinsGranted,
        totalShieldsGranted: record.totalShieldsGranted,
        totalLootBoxesGranted: record.totalLootBoxesGranted,
        lastUnlockAt: record.lastUnlockAt,
      })
      .onConflictDoUpdate({
        target: achievementAnalytics.id,
        set: {
          totalUnlocked: record.totalUnlocked,
          totalCoinsGranted: record.totalCoinsGranted,
          totalShieldsGranted: record.totalShieldsGranted,
          totalLootBoxesGranted: record.totalLootBoxesGranted,
          lastUnlockAt: record.lastUnlockAt,
        },
      });
  },

  async recordUnlock(rewards: AchievementReward[], unlockedAt: string): Promise<AchievementAnalyticsRecord> {
    const analytics = await AchievementAnalyticsRepository.getOrCreate();
    const totals = sumRewards(rewards);

    const next: AchievementAnalyticsRecord = {
      totalUnlocked: analytics.totalUnlocked + 1,
      totalCoinsGranted: analytics.totalCoinsGranted + totals.coins,
      totalShieldsGranted: analytics.totalShieldsGranted + totals.shields,
      totalLootBoxesGranted: analytics.totalLootBoxesGranted + totals.lootBoxes,
      lastUnlockAt: unlockedAt,
    };

    await AchievementAnalyticsRepository.save(next);
    return next;
  },
};
