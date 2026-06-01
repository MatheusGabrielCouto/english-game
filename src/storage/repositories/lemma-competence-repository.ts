import { desc, eq } from 'drizzle-orm';

import type { LemmaCompetenceRecord, LemmaCompetenceSource } from '@/types/lemma-competence';

import { getDb } from '../database/client';
import { lemmaCompetence } from '../database/schema';

const mapRow = (row: typeof lemmaCompetence.$inferSelect): LemmaCompetenceRecord => ({
  lemma: row.lemma,
  recognitionScore: row.recognitionScore,
  grammarScore: row.grammarScore,
  retentionScore: row.retentionScore,
  transferScore: row.transferScore,
  weaknessScore: row.weaknessScore,
  timesSeen: row.timesSeen,
  timesCorrect: row.timesCorrect,
  lastSeenAt: row.lastSeenAt,
  lastSource: row.lastSource as LemmaCompetenceSource | null,
  updatedAt: row.updatedAt,
});

export const LemmaCompetenceRepository = {
  async get(lemma: string): Promise<LemmaCompetenceRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lemmaCompetence)
      .where(eq(lemmaCompetence.lemma, lemma))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async upsert(record: LemmaCompetenceRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(lemmaCompetence)
      .values({
        lemma: record.lemma,
        recognitionScore: record.recognitionScore,
        grammarScore: record.grammarScore,
        retentionScore: record.retentionScore,
        transferScore: record.transferScore,
        weaknessScore: record.weaknessScore,
        timesSeen: record.timesSeen,
        timesCorrect: record.timesCorrect,
        lastSeenAt: record.lastSeenAt,
        lastSource: record.lastSource,
        updatedAt: record.updatedAt,
      })
      .onConflictDoUpdate({
        target: lemmaCompetence.lemma,
        set: {
          recognitionScore: record.recognitionScore,
          grammarScore: record.grammarScore,
          retentionScore: record.retentionScore,
          transferScore: record.transferScore,
          weaknessScore: record.weaknessScore,
          timesSeen: record.timesSeen,
          timesCorrect: record.timesCorrect,
          lastSeenAt: record.lastSeenAt,
          lastSource: record.lastSource,
          updatedAt: record.updatedAt,
        },
      });
  },

  async listWeakLemmas(limit: number): Promise<LemmaCompetenceRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lemmaCompetence)
      .orderBy(desc(lemmaCompetence.weaknessScore))
      .limit(limit);

    return rows.map(mapRow);
  },

  async listSpacedLemmas(limit: number): Promise<LemmaCompetenceRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lemmaCompetence)
      .orderBy(lemmaCompetence.weaknessScore)
      .limit(limit);

    return rows.map(mapRow);
  },

  async listAll(): Promise<LemmaCompetenceRecord[]> {
    const db = getDb();
    const rows = await db.select().from(lemmaCompetence);
    return rows.map(mapRow);
  },
};
