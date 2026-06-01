import { eq } from 'drizzle-orm';

import type { AchievementUnlockRecord } from '@/types/achievement';

import { getDb } from '../database/client';
import { achievementUnlocks } from '../database/schema';

export const AchievementUnlockRepository = {
  async findAll(): Promise<AchievementUnlockRecord[]> {
    const db = getDb();
    const rows = await db.select().from(achievementUnlocks);
    return rows.map((row) => ({
      achievementKey: row.achievementKey,
      unlockedAt: row.unlockedAt,
    }));
  },

  async findByKey(key: string): Promise<AchievementUnlockRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(achievementUnlocks)
      .where(eq(achievementUnlocks.achievementKey, key))
      .limit(1);

    if (!rows[0]) return null;

    return {
      achievementKey: rows[0].achievementKey,
      unlockedAt: rows[0].unlockedAt,
    };
  },

  async create(key: string, unlockedAt: string): Promise<boolean> {
    const existing = await AchievementUnlockRepository.findByKey(key);
    if (existing) return false;

    const db = getDb();

    try {
      await db.insert(achievementUnlocks).values({
        achievementKey: key,
        unlockedAt,
      });
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/UNIQUE constraint failed/i.test(message)) return false;
      throw error;
    }
  },
};
