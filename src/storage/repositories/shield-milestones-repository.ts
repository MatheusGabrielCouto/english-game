import { eq } from 'drizzle-orm';

import type { ShieldMilestoneKey } from '@/types/shield';

import { getDb } from '../database/client';
import { shieldMilestonesClaimed } from '../database/schema';

export const ShieldMilestonesRepository = {
  async isClaimed(milestoneKey: ShieldMilestoneKey): Promise<boolean> {
    const db = getDb();
    const rows = await db
      .select()
      .from(shieldMilestonesClaimed)
      .where(eq(shieldMilestonesClaimed.milestoneKey, milestoneKey))
      .limit(1);

    return rows.length > 0;
  },

  async markClaimed(milestoneKey: ShieldMilestoneKey): Promise<void> {
    const db = getDb();
    await db
      .insert(shieldMilestonesClaimed)
      .values({
        milestoneKey,
        claimedAt: new Date().toISOString(),
      })
      .onConflictDoNothing();
  },
};
