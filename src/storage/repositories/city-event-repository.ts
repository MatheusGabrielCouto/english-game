import { eq } from 'drizzle-orm';

import type { CityEventStateRecord } from '@/types/city-event';

import { getDb } from '../database/client';
import { cityEventState } from '../database/schema';

const mapRow = (row: typeof cityEventState.$inferSelect): CityEventStateRecord => ({
  eventKey: row.eventKey,
  spiritProgress: row.spiritProgress,
  vocabWordsLearned: row.vocabWordsLearned,
  introSeen: row.introSeen,
  completedAt: row.completedAt,
  startedAt: row.startedAt,
  updatedAt: row.updatedAt,
});

export const CityEventRepository = {
  async findByKey(eventKey: string): Promise<CityEventStateRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(cityEventState)
      .where(eq(cityEventState.eventKey, eventKey))
      .limit(1);
    const row = rows[0];
    return row ? mapRow(row) : null;
  },

  async upsert(record: CityEventStateRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(cityEventState)
      .values({
        eventKey: record.eventKey,
        spiritProgress: record.spiritProgress,
        vocabWordsLearned: record.vocabWordsLearned,
        introSeen: record.introSeen,
        completedAt: record.completedAt,
        startedAt: record.startedAt,
        updatedAt: record.updatedAt,
      })
      .onConflictDoUpdate({
        target: cityEventState.eventKey,
        set: {
          spiritProgress: record.spiritProgress,
          vocabWordsLearned: record.vocabWordsLearned,
          introSeen: record.introSeen,
          completedAt: record.completedAt,
          startedAt: record.startedAt,
          updatedAt: record.updatedAt,
        },
      });
  },
};
