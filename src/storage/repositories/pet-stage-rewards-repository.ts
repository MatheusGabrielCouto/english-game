import { eq } from 'drizzle-orm';

import type { PetStageValue } from '@/types/pet';

import { getDb } from '../database/client';
import { petStageRewardsClaimed } from '../database/schema';

export const PetStageRewardsRepository = {
  async isClaimed(stage: PetStageValue): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select()
      .from(petStageRewardsClaimed)
      .where(eq(petStageRewardsClaimed.stage, stage))
      .limit(1);

    return rows.length > 0;
  },

  async markClaimed(stage: PetStageValue): Promise<void> {
    const db = getDb();
    await db
      .insert(petStageRewardsClaimed)
      .values({
        stage,
        claimedAt: new Date().toISOString(),
      })
      .onConflictDoNothing();
  },

  async findAll(): Promise<{ stage: PetStageValue; claimedAt: string }[]> {
    const db = getDb();
    const rows = await db.select().from(petStageRewardsClaimed);

    return rows.map((row) => ({
      stage: row.stage as PetStageValue,
      claimedAt: row.claimedAt,
    }));
  },
};
