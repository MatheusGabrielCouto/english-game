import { eq } from 'drizzle-orm';

import type { LemmaMasteryRecord } from '@/types/lexicon-brick';

import { getDb } from '../database/client';
import { lemmaMastery } from '../database/schema';

const parseTags = (json: string): string[] => {
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
};

const mapRow = (row: typeof lemmaMastery.$inferSelect): LemmaMasteryRecord => ({
  lemmaId: row.lemmaId,
  lemma: row.lemma,
  translation: row.translation,
  recognitionScore: row.recognitionScore,
  productionScore: row.productionScore,
  lastReviewAt: row.lastReviewAt,
  nextReviewAt: row.nextReviewAt,
  decayStage: row.decayStage,
  themeTags: parseTags(row.themeTagsJson),
  contextsSeen: parseTags(row.contextsSeenJson),
});

export const LemmaMasteryRepository = {
  async findById(lemmaId: string): Promise<LemmaMasteryRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lemmaMastery)
      .where(eq(lemmaMastery.lemmaId, lemmaId))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async listAll(): Promise<LemmaMasteryRecord[]> {
    const db = getDb();
    const rows = await db.select().from(lemmaMastery);
    return rows.map(mapRow);
  },

  async upsert(record: LemmaMasteryRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(lemmaMastery)
      .values({
        lemmaId: record.lemmaId,
        lemma: record.lemma,
        translation: record.translation,
        recognitionScore: record.recognitionScore,
        productionScore: record.productionScore,
        lastReviewAt: record.lastReviewAt,
        nextReviewAt: record.nextReviewAt,
        decayStage: record.decayStage,
        themeTagsJson: JSON.stringify(record.themeTags),
        contextsSeenJson: JSON.stringify(record.contextsSeen),
      })
      .onConflictDoUpdate({
        target: lemmaMastery.lemmaId,
        set: {
          lemma: record.lemma,
          translation: record.translation,
          recognitionScore: record.recognitionScore,
          productionScore: record.productionScore,
          lastReviewAt: record.lastReviewAt,
          nextReviewAt: record.nextReviewAt,
          decayStage: record.decayStage,
          themeTagsJson: JSON.stringify(record.themeTags),
          contextsSeenJson: JSON.stringify(record.contextsSeen),
        },
      });
  },
};
