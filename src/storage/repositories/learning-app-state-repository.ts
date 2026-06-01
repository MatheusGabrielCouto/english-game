import { eq } from 'drizzle-orm';

import { getDb } from '../database/client';
import { learningAppState } from '../database/schema';

export const LearningAppStateRepository = {
  async get(key: string): Promise<string | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(learningAppState)
      .where(eq(learningAppState.stateKey, key))
      .limit(1);

    return rows[0]?.stateValue ?? null;
  },

  async set(key: string, value: string): Promise<void> {
    const db = getDb();
    const updatedAt = new Date().toISOString();

    await db
      .insert(learningAppState)
      .values({ stateKey: key, stateValue: value, updatedAt })
      .onConflictDoUpdate({
        target: learningAppState.stateKey,
        set: { stateValue: value, updatedAt },
      });
  },
};
