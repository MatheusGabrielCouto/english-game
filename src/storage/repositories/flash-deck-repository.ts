import { and, asc, eq, lte, sql } from 'drizzle-orm';

import type {
    FlashCardRecord,
    FlashCardSource,
    FlashCardState,
    FlashDeckRecord,
    FlashReviewLogRecord
} from '@/types/flash-card';
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card';

import { getDb } from '../database/client';
import { flashCards, flashDecks, flashReviewLog, flashStudySessions } from '../database/schema';

const todayDateKey = (date = new Date()): string => date.toISOString().slice(0, 10);

const parseTags = (json: string): string[] => {
  try {
    return JSON.parse(json) as string[];
  } catch {
    return [];
  }
};

const mapDeckRow = (row: typeof flashDecks.$inferSelect): FlashDeckRecord => ({
  id: row.id,
  name: row.name,
  description: row.description,
  coverEmoji: row.coverEmoji,
  sortOrder: row.sortOrder,
  newPerDay: row.newPerDay,
  reviewCap: row.reviewCap,
  createdAt: row.createdAt,
  archivedAt: row.archivedAt,
});

const mapCardRow = (row: typeof flashCards.$inferSelect): FlashCardRecord => ({
  id: row.id,
  deckId: row.deckId,
  lemma: row.lemma,
  front: row.front,
  back: row.back,
  exampleSentence: row.exampleSentence,
  audioUri: row.audioUri,
  imageUri: row.imageUri,
  tags: parseTags(row.tagsJson),
  source: row.source as FlashCardSource,
  easeFactor: row.easeFactor,
  intervalDays: row.intervalDays,
  repetitions: row.repetitions,
  lapseCount: row.lapseCount,
  dueAt: row.dueAt,
  state: row.state as FlashCardState,
  lastReviewedAt: row.lastReviewedAt,
  createdAt: row.createdAt,
  suspended: row.suspended,
});

const deckToRow = (deck: FlashDeckRecord) => ({
  id: deck.id,
  name: deck.name,
  description: deck.description,
  coverEmoji: deck.coverEmoji,
  sortOrder: deck.sortOrder,
  newPerDay: deck.newPerDay,
  reviewCap: deck.reviewCap,
  createdAt: deck.createdAt,
  archivedAt: deck.archivedAt,
});

const cardToInsert = (card: FlashCardRecord) => ({
  id: card.id,
  deckId: card.deckId,
  lemma: card.lemma,
  front: card.front,
  back: card.back,
  exampleSentence: card.exampleSentence,
  audioUri: card.audioUri,
  imageUri: card.imageUri,
  tagsJson: JSON.stringify(card.tags),
  source: card.source,
  easeFactor: card.easeFactor,
  intervalDays: card.intervalDays,
  repetitions: card.repetitions,
  lapseCount: card.lapseCount,
  dueAt: card.dueAt,
  state: card.state,
  lastReviewedAt: card.lastReviewedAt,
  createdAt: card.createdAt,
  suspended: card.suspended,
});

export const FlashDeckRepository = {
  async listDecks(): Promise<FlashDeckRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(flashDecks)
      .where(sql`${flashDecks.archivedAt} IS NULL`)
      .orderBy(asc(flashDecks.sortOrder), asc(flashDecks.name));

    return rows.map(mapDeckRow);
  },

  async getDeck(id: string): Promise<FlashDeckRecord | null> {
    const db = getDb();
    const rows = await db.select().from(flashDecks).where(eq(flashDecks.id, id)).limit(1);
    return rows[0] ? mapDeckRow(rows[0]) : null;
  },

  async getDefaultDeck(): Promise<FlashDeckRecord | null> {
    return FlashDeckRepository.getDeck(DEFAULT_FLASH_DECK_ID);
  },

  async insertDeck(deck: FlashDeckRecord): Promise<void> {
    const db = getDb();
    await db.insert(flashDecks).values(deckToRow(deck));
  },

  async updateDeck(deck: FlashDeckRecord): Promise<void> {
    const db = getDb();
    await db.update(flashDecks).set(deckToRow(deck)).where(eq(flashDecks.id, deck.id));
  },

  async archiveDeck(id: string, archivedAt: string): Promise<void> {
    const db = getDb();
    await db.update(flashDecks).set({ archivedAt }).where(eq(flashDecks.id, id));
  },

  async listCardsByDeck(deckId: string): Promise<FlashCardRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(flashCards)
      .where(eq(flashCards.deckId, deckId))
      .orderBy(asc(flashCards.dueAt), asc(flashCards.createdAt));

    return rows.map(mapCardRow);
  },

  async deleteCard(id: string): Promise<void> {
    const db = getDb();
    await db.delete(flashCards).where(eq(flashCards.id, id));
  },

  async countCards(deckId?: string): Promise<number> {
    const db = getDb();

    const rows = deckId
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(flashCards)
          .where(eq(flashCards.deckId, deckId))
      : await db.select({ count: sql<number>`count(*)` }).from(flashCards);

    return Number(rows[0]?.count ?? 0);
  },

  async countDue(deckId?: string): Promise<number> {
    const db = getDb();
    const now = new Date().toISOString();
    const conditions = [lte(flashCards.dueAt, now), eq(flashCards.suspended, false)];

    if (deckId) {
      conditions.push(eq(flashCards.deckId, deckId));
    }

    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(flashCards)
      .where(and(...conditions));

    return Number(rows[0]?.count ?? 0);
  },

  async getOldestDueAt(): Promise<string | null> {
    const db = getDb();
    const now = new Date().toISOString();
    const rows = await db
      .select({ dueAt: flashCards.dueAt })
      .from(flashCards)
      .where(and(lte(flashCards.dueAt, now), eq(flashCards.suspended, false)))
      .orderBy(asc(flashCards.dueAt))
      .limit(1);

    return rows[0]?.dueAt ?? null;
  },

  async listDue(deckId?: string, limit = 200): Promise<FlashCardRecord[]> {
    const db = getDb();
    const now = new Date().toISOString();
    const conditions = [lte(flashCards.dueAt, now), eq(flashCards.suspended, false)];

    if (deckId) {
      conditions.push(eq(flashCards.deckId, deckId));
    }

    const rows = await db
      .select()
      .from(flashCards)
      .where(and(...conditions))
      .orderBy(asc(flashCards.dueAt))
      .limit(limit);

    return rows.map(mapCardRow);
  },

  async getCard(id: string): Promise<FlashCardRecord | null> {
    const db = getDb();
    const rows = await db.select().from(flashCards).where(eq(flashCards.id, id)).limit(1);
    return rows[0] ? mapCardRow(rows[0]) : null;
  },

  async insertCard(card: FlashCardRecord): Promise<void> {
    const db = getDb();
    await db.insert(flashCards).values(cardToInsert(card));
  },

  async insertCardsBatch(cards: FlashCardRecord[]): Promise<void> {
    if (cards.length === 0) return;

    const db = getDb();
    const chunkSize = 50;

    for (let offset = 0; offset < cards.length; offset += chunkSize) {
      const chunk = cards.slice(offset, offset + chunkSize);
      await db.insert(flashCards).values(chunk.map(cardToInsert));
    }
  },

  async countCardsBySource(deckId: string, source: FlashCardSource): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(flashCards)
      .where(and(eq(flashCards.deckId, deckId), eq(flashCards.source, source)));

    return Number(rows[0]?.count ?? 0);
  },

  async updateCard(card: FlashCardRecord): Promise<void> {
    const db = getDb();
    await db.update(flashCards).set(cardToInsert(card)).where(eq(flashCards.id, card.id));
  },

  async insertReviewLog(entry: FlashReviewLogRecord): Promise<void> {
    const db = getDb();
    await db.insert(flashReviewLog).values({
      id: entry.id,
      cardId: entry.cardId,
      rating: entry.rating,
      previousInterval: entry.previousInterval,
      newInterval: entry.newInterval,
      reviewedAt: entry.reviewedAt,
      sessionId: entry.sessionId,
      durationMs: entry.durationMs,
    });
  },

  async countReviewsOnDate(deckId: string, dateKey = todayDateKey()): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(flashReviewLog)
      .innerJoin(flashCards, eq(flashCards.id, flashReviewLog.cardId))
      .where(
        and(eq(flashCards.deckId, deckId), sql`${flashReviewLog.reviewedAt} LIKE ${`${dateKey}%`}`),
      );

    return Number(rows[0]?.count ?? 0);
  },

  async countCardsCreatedOnDate(deckId: string, dateKey = todayDateKey()): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(flashCards)
      .where(
        and(eq(flashCards.deckId, deckId), sql`${flashCards.createdAt} LIKE ${`${dateKey}%`}`),
      );

    return Number(rows[0]?.count ?? 0);
  },

  async countCardsByState(
    deckId: string,
  ): Promise<{ new: number; learning: number; mature: number; leech: number; total: number }> {
    const db = getDb();
    const rows = await db
      .select()
      .from(flashCards)
      .where(and(eq(flashCards.deckId, deckId), eq(flashCards.suspended, false)));

    let newCount = 0;
    let learningCount = 0;
    let matureCount = 0;
    let leechCount = 0;

    for (const row of rows) {
      const card = mapCardRow(row);
      if (card.state === 'new') newCount += 1;
      if (card.state === 'learning' || card.state === 'relearning') learningCount += 1;
      if (card.intervalDays >= 21) matureCount += 1;
      if (card.lapseCount >= 8) leechCount += 1;
    }

    return {
      new: newCount,
      learning: learningCount,
      mature: matureCount,
      leech: leechCount,
      total: rows.length,
    };
  },

  async getDistinctReviewDateKeys(deckId: string): Promise<string[]> {
    const db = getDb();
    const rows = await db
      .select({
        dateKey: sql<string>`substr(${flashReviewLog.reviewedAt}, 1, 10)`,
      })
      .from(flashReviewLog)
      .innerJoin(flashCards, eq(flashCards.id, flashReviewLog.cardId))
      .where(eq(flashCards.deckId, deckId))
      .groupBy(sql`substr(${flashReviewLog.reviewedAt}, 1, 10)`)
      .orderBy(sql`substr(${flashReviewLog.reviewedAt}, 1, 10) DESC`);

    return rows.map((row) => row.dateKey).filter(Boolean);
  },

  async getStudySession(sessionId: string): Promise<{
    id: string;
    deckId: string;
    mode: string;
    cardsReviewed: number;
    startedAt: string;
    endedAt: string | null;
  } | null> {
    const db = getDb();
    const rows = await db
      .select()
      .from(flashStudySessions)
      .where(eq(flashStudySessions.id, sessionId))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      deckId: row.deckId ?? DEFAULT_FLASH_DECK_ID,
      mode: row.mode,
      cardsReviewed: row.cardsReviewed,
      startedAt: row.startedAt,
      endedAt: row.endedAt,
    };
  },

  async insertStudySession(session: {
    id: string;
    deckId: string;
    mode: string;
    cardsReviewed: number;
    startedAt: string;
    endedAt: string | null;
  }): Promise<void> {
    const db = getDb();
    await db.insert(flashStudySessions).values({
      id: session.id,
      deckId: session.deckId,
      mode: session.mode,
      cardsReviewed: session.cardsReviewed,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    });
  },

  async updateStudySession(
    sessionId: string,
    patch: { cardsReviewed: number; endedAt: string },
  ): Promise<void> {
    const db = getDb();
    await db
      .update(flashStudySessions)
      .set({
        cardsReviewed: patch.cardsReviewed,
        endedAt: patch.endedAt,
      })
      .where(eq(flashStudySessions.id, sessionId));
  },
};
