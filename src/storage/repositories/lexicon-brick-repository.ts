import { and, asc, eq, gte, isNull, sql } from 'drizzle-orm';

import type { LexiconBrickRecord, LexiconBrickSource } from '@/types/lexicon-brick';

import { getDb } from '../database/client';
import { lexiconBricks } from '../database/schema';

const parseTags = (json: string): string[] => {
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
};

const mapRow = (row: typeof lexiconBricks.$inferSelect): LexiconBrickRecord => ({
  brickId: row.brickId,
  lemmaId: row.lemmaId,
  lemma: row.lemma,
  translation: row.translation,
  themeTags: parseTags(row.themeTagsJson),
  source: row.source as LexiconBrickSource,
  mintedAt: row.mintedAt,
  lastReviewAt: row.lastReviewAt,
  nextReviewAt: row.nextReviewAt,
  decayStage: row.decayStage,
  placedPoiKey: row.placedPoiKey,
  placedProjectKey: row.placedProjectKey,
  placedAt: row.placedAt,
});

export const LexiconBrickRepository = {
  async findById(brickId: string): Promise<LexiconBrickRecord | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lexiconBricks)
      .where(eq(lexiconBricks.brickId, brickId))
      .limit(1);

    return rows[0] ? mapRow(rows[0]) : null;
  },

  async listAll(): Promise<LexiconBrickRecord[]> {
    const db = getDb();
    const rows = await db.select().from(lexiconBricks).orderBy(asc(lexiconBricks.mintedAt));
    return rows.map(mapRow);
  },

  async listUnplaced(): Promise<LexiconBrickRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lexiconBricks)
      .where(isNull(lexiconBricks.placedPoiKey))
      .orderBy(asc(lexiconBricks.mintedAt));

    return rows.map(mapRow);
  },

  async listCrackedUnplaced(): Promise<LexiconBrickRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lexiconBricks)
      .where(and(isNull(lexiconBricks.placedPoiKey), gte(lexiconBricks.decayStage, 2)))
      .orderBy(asc(lexiconBricks.mintedAt));

    return rows.map(mapRow);
  },

  async listCrackedByProject(
    poiKey: string,
    projectKey: string,
  ): Promise<LexiconBrickRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(lexiconBricks)
      .where(
        and(
          eq(lexiconBricks.placedPoiKey, poiKey),
          eq(lexiconBricks.placedProjectKey, projectKey),
        ),
      )
      .orderBy(asc(lexiconBricks.mintedAt));

    return rows.map(mapRow).filter((b) => b.decayStage >= 2);
  },

  async countUnplacedByLemma(lemmaId: string): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(lexiconBricks)
      .where(
        and(eq(lexiconBricks.lemmaId, lemmaId), isNull(lexiconBricks.placedPoiKey)),
      );

    return Number(rows[0]?.count ?? 0);
  },

  async upsert(record: LexiconBrickRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(lexiconBricks)
      .values({
        brickId: record.brickId,
        lemmaId: record.lemmaId,
        lemma: record.lemma,
        translation: record.translation,
        themeTagsJson: JSON.stringify(record.themeTags),
        source: record.source,
        mintedAt: record.mintedAt,
        lastReviewAt: record.lastReviewAt,
        nextReviewAt: record.nextReviewAt,
        decayStage: record.decayStage,
        placedPoiKey: record.placedPoiKey,
        placedProjectKey: record.placedProjectKey,
        placedAt: record.placedAt,
      })
      .onConflictDoUpdate({
        target: lexiconBricks.brickId,
        set: {
          lastReviewAt: record.lastReviewAt,
          nextReviewAt: record.nextReviewAt,
          decayStage: record.decayStage,
          placedPoiKey: record.placedPoiKey,
          placedProjectKey: record.placedProjectKey,
          placedAt: record.placedAt,
        },
      });
  },
};
