import type { FlashCardRecord, FlashDeckRecord, FlashSrsRating } from '@/types/flash-card';
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card';

import { FlashDeckRepository } from '@/storage/repositories/flash-deck-repository';

import {
    cardMatchesSearch,
    cardMatchesTag,
    collectTagsFromCards,
    parseTagsInput,
} from '../utils/flash-card-search';
import { computeReviewStreakDays } from '../utils/review-streak';
import { LemmaCompetenceService } from '@/features/learning/services/lemma-competence-service';
import { GameEvents } from '@/services/game-events';
import type { FlashCardSource } from '@/types/flash-card';

import { FlashSrsService } from './flash-srs-service';

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const normalizeLemma = (front: string): string | null => {
  const trimmed = front.trim().toLowerCase();
  if (!trimmed) return null;
  const firstToken = trimmed.split(/\s+/)[0]?.replace(/[^a-z'-]/gi, '') ?? '';
  return firstToken.length > 0 ? firstToken : null;
};

export type FlashDeckHubSummary = {
  defaultDeck: FlashDeckRecord | null;
  dueCount: number;
  totalCards: number;
};

export type FlashDeckStats = {
  newCount: number;
  learningCount: number;
  dueCount: number;
  matureCount: number;
  leechCount: number;
  reviewStreakDays: number;
  reviewsToday: number;
  reviewsRemainingToday: number;
  newCardsCreatedToday: number;
  newCardsRemainingToday: number;
};

export type CreateFlashCardInput = {
  front: string;
  back: string;
  exampleSentence?: string;
  deckId?: string;
  tags?: string[];
  tagsInput?: string;
  source?: FlashCardSource;
};

export type UpdateFlashCardInput = {
  front: string;
  back: string;
  exampleSentence?: string | null;
  tags?: string[];
  tagsInput?: string;
};

export type CreateFlashDeckInput = {
  name: string;
  coverEmoji?: string;
  description?: string;
};

export type UpdateFlashDeckInput = {
  name: string;
  coverEmoji?: string;
  description?: string | null;
};

export type FlashDeckListItem = FlashDeckRecord & {
  dueCount: number;
  totalCards: number;
};

export type FlashDeckCardsFilter = {
  search?: string;
  tag?: string | null;
};

const resolveTags = (tags?: string[], tagsInput?: string): string[] => {
  if (tags && tags.length > 0) return [...new Set(tags.map((t) => t.trim().toLowerCase()).filter(Boolean))];
  if (tagsInput) return parseTagsInput(tagsInput);
  return [];
};

export const FlashDeckService = {
  async getDeck(deckId: string): Promise<FlashDeckRecord | null> {
    return FlashDeckRepository.getDeck(deckId);
  },

  async listDecksWithSummary(): Promise<FlashDeckListItem[]> {
    const decks = await FlashDeckRepository.listDecks();

    return Promise.all(
      decks.map(async (deck) => {
        const stats = await FlashDeckService.getDeckStats(deck.id);
        const totalCards = await FlashDeckRepository.countCards(deck.id);
        return {
          ...deck,
          dueCount: stats.dueCount,
          totalCards,
        };
      }),
    );
  },

  async listCards(
    deckId: string,
    filter: FlashDeckCardsFilter = {},
  ): Promise<FlashCardRecord[]> {
    const cards = await FlashDeckRepository.listCardsByDeck(deckId);
    return cards.filter(
      (card) => cardMatchesSearch(card, filter.search ?? '') && cardMatchesTag(card, filter.tag ?? null),
    );
  },

  async listDeckTags(deckId: string): Promise<string[]> {
    const cards = await FlashDeckRepository.listCardsByDeck(deckId);
    return collectTagsFromCards(cards);
  },

  async createDeck(input: CreateFlashDeckInput): Promise<FlashDeckRecord> {
    const name = input.name.trim();
    if (!name) throw new Error('Nome do caderno é obrigatório');

    const decks = await FlashDeckRepository.listDecks();
    const now = new Date().toISOString();
    const deck: FlashDeckRecord = {
      id: createId('flash_deck'),
      name,
      description: input.description?.trim() || null,
      coverEmoji: input.coverEmoji?.trim() || '📒',
      sortOrder: decks.length,
      newPerDay: 10,
      reviewCap: 80,
      createdAt: now,
      archivedAt: null,
    };

    await FlashDeckRepository.insertDeck(deck);
    return deck;
  },

  async updateDeck(deckId: string, input: UpdateFlashDeckInput): Promise<FlashDeckRecord> {
    const deck = await FlashDeckRepository.getDeck(deckId);
    if (!deck) throw new Error('Caderno não encontrado');

    const name = input.name.trim();
    if (!name) throw new Error('Nome do caderno é obrigatório');

    const updated: FlashDeckRecord = {
      ...deck,
      name,
      coverEmoji: input.coverEmoji?.trim() || deck.coverEmoji,
      description: input.description?.trim() || null,
    };

    await FlashDeckRepository.updateDeck(updated);
    return updated;
  },

  async archiveDeck(deckId: string): Promise<void> {
    if (deckId === DEFAULT_FLASH_DECK_ID) {
      throw new Error('O caderno padrão não pode ser arquivado');
    }

    const deck = await FlashDeckRepository.getDeck(deckId);
    if (!deck) throw new Error('Caderno não encontrado');

    await FlashDeckRepository.archiveDeck(deckId, new Date().toISOString());
  },

  async getCard(cardId: string): Promise<FlashCardRecord | null> {
    return FlashDeckRepository.getCard(cardId);
  },

  async updateCard(cardId: string, input: UpdateFlashCardInput): Promise<FlashCardRecord> {
    const card = await FlashDeckRepository.getCard(cardId);
    if (!card) throw new Error('Carta não encontrada');

    const front = input.front.trim();
    const back = input.back.trim();
    if (!front || !back) throw new Error('Frente e verso são obrigatórios');

    const updated: FlashCardRecord = {
      ...card,
      front,
      back,
      lemma: normalizeLemma(front),
      exampleSentence: input.exampleSentence?.trim() || null,
      tags: resolveTags(input.tags, input.tagsInput),
    };

    await FlashDeckRepository.updateCard(updated);
    return updated;
  },

  async deleteCard(cardId: string): Promise<void> {
    await FlashDeckRepository.deleteCard(cardId);
  },

  async suspendCard(cardId: string, suspended: boolean): Promise<void> {
    const card = await FlashDeckRepository.getCard(cardId);
    if (!card) throw new Error('Carta não encontrada');
    await FlashDeckRepository.updateCard({ ...card, suspended });
  },

  async resetLeechCard(cardId: string): Promise<void> {
    const card = await FlashDeckRepository.getCard(cardId);
    if (!card) throw new Error('Carta não encontrada');
    await FlashDeckRepository.updateCard({
      ...card,
      lapseCount: 0,
      state: card.repetitions > 0 ? 'review' : 'new',
    });
  },

  async importCardsFromCsv(
    deckId: string,
    rows: { front: string; back: string; exampleSentence?: string; tags?: string[] }[],
  ): Promise<{ imported: number; failed: number }> {
    let imported = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        await FlashDeckService.createCard({
          deckId,
          front: row.front,
          back: row.back,
          exampleSentence: row.exampleSentence,
          tags: row.tags,
          source: 'import',
        });
        imported += 1;
      } catch {
        failed += 1;
      }
    }

    return { imported, failed };
  },

  async getDeckStats(deckId = DEFAULT_FLASH_DECK_ID): Promise<FlashDeckStats> {
    const deck = await FlashDeckRepository.getDeck(deckId);
    const newPerDay = deck?.newPerDay ?? 10;
    const reviewCap = deck?.reviewCap ?? 80;

    const [
      stateCounts,
      dueCount,
      reviewsToday,
      newCardsCreatedToday,
      reviewDateKeys,
    ] = await Promise.all([
      FlashDeckRepository.countCardsByState(deckId),
      FlashDeckRepository.countDue(deckId),
      FlashDeckRepository.countReviewsOnDate(deckId),
      FlashDeckRepository.countCardsCreatedOnDate(deckId),
      FlashDeckRepository.getDistinctReviewDateKeys(deckId),
    ]);

    const reviewsRemainingToday = Math.max(0, reviewCap - reviewsToday);
    const cappedDueCount = Math.min(dueCount, reviewsRemainingToday);

    return {
      newCount: stateCounts.new,
      learningCount: stateCounts.learning,
      dueCount: cappedDueCount,
      matureCount: stateCounts.mature,
      leechCount: stateCounts.leech,
      reviewStreakDays: computeReviewStreakDays(reviewDateKeys),
      reviewsToday,
      reviewsRemainingToday,
      newCardsCreatedToday,
      newCardsRemainingToday: Math.max(0, newPerDay - newCardsCreatedToday),
    };
  },

  async getHubSummary(deckId = DEFAULT_FLASH_DECK_ID): Promise<FlashDeckHubSummary> {
    const stats = await FlashDeckService.getDeckStats(deckId);
    const defaultDeck = await FlashDeckRepository.getDeck(deckId);

    return {
      defaultDeck,
      dueCount: stats.dueCount,
      totalCards: (await FlashDeckRepository.countCards(deckId)) || 0,
    };
  },

  async listDueCards(deckId = DEFAULT_FLASH_DECK_ID): Promise<FlashCardRecord[]> {
    const deck = await FlashDeckRepository.getDeck(deckId);
    const reviewCap = deck?.reviewCap ?? 80;
    const reviewsToday = await FlashDeckRepository.countReviewsOnDate(deckId);
    const remaining = Math.max(0, reviewCap - reviewsToday);

    if (remaining === 0) {
      return [];
    }

    const due = await FlashDeckRepository.listDue(deckId, remaining);
    return due;
  },

  async createCard(input: CreateFlashCardInput): Promise<FlashCardRecord> {
    const deckId = input.deckId ?? DEFAULT_FLASH_DECK_ID;
    const deck = await FlashDeckRepository.getDeck(deckId);

    if (!deck) {
      throw new Error(`Deck não encontrado: ${deckId}`);
    }

    const createdToday = await FlashDeckRepository.countCardsCreatedOnDate(deckId);
    if (createdToday >= deck.newPerDay) {
      throw new Error(
        `Limite de ${deck.newPerDay} cartas novas por dia atingido. Volte amanhã ou revise as que já tem.`,
      );
    }

    const front = input.front.trim();
    const back = input.back.trim();

    if (!front || !back) {
      throw new Error('Frente e verso são obrigatórios');
    }

    const now = new Date();
    const card: FlashCardRecord = {
      id: createId('flash_card'),
      deckId,
      lemma: normalizeLemma(front),
      front,
      back,
      exampleSentence: input.exampleSentence?.trim() || null,
      audioUri: null,
      imageUri: null,
      tags: resolveTags(input.tags, input.tagsInput),
      source: input.source ?? 'user',
      ...FlashSrsService.initialFields(now),
      lastReviewedAt: null,
      createdAt: now.toISOString(),
      suspended: false,
    };

    await FlashDeckRepository.insertCard(card);
    return card;
  },

  async startStudySession(deckId = DEFAULT_FLASH_DECK_ID): Promise<string> {
    const sessionId = createId('flash_session');
    const startedAt = new Date().toISOString();

    await FlashDeckRepository.insertStudySession({
      id: sessionId,
      deckId,
      mode: 'classic',
      cardsReviewed: 0,
      startedAt,
      endedAt: null,
    });

    return sessionId;
  },

  async completeStudySession(sessionId: string, cardsReviewed: number): Promise<void> {
    const session = await FlashDeckRepository.getStudySession(sessionId);
    await FlashDeckRepository.updateStudySession(sessionId, {
      cardsReviewed,
      endedAt: new Date().toISOString(),
    });

    if (session && cardsReviewed > 0) {
      GameEvents.emit({
        type: 'FLASH_SESSION_DONE',
        sessionId,
        deckId: session.deckId,
        cardsReviewed,
        mode: session.mode,
      });
      const { FlashNotificationService } = await import('./flash-notification-service');
      await FlashNotificationService.rescheduleDueReminder();
    }
  },

  async createCardFromDuelSuggest(input: {
    front: string;
    back: string;
    exampleSentence?: string;
    deckId?: string;
  }): Promise<FlashCardRecord> {
    return FlashDeckService.createCard({
      ...input,
      source: 'duel_suggest',
      tags: ['duelo'],
    });
  },

  async listDueCardsForCardDuel(limit = 5): Promise<FlashCardRecord[]> {
    const decks = await FlashDeckRepository.listDecks();
    const activeDecks = decks.filter((deck) => !deck.archivedAt);
    const collected: FlashCardRecord[] = [];

    for (const deck of activeDecks) {
      const due = await FlashDeckService.listDueCards(deck.id);
      collected.push(...due);
      if (collected.length >= limit) break;
    }

    return collected.slice(0, limit);
  },

  async submitReview(
    cardId: string,
    rating: FlashSrsRating,
    sessionId?: string,
  ): Promise<FlashCardRecord | null> {
    const card = await FlashDeckRepository.getCard(cardId);
    if (!card) return null;

    const previousInterval = card.intervalDays;
    const patch = FlashSrsService.applyRating(card, rating);
    const updated: FlashCardRecord = { ...card, ...patch };

    await FlashDeckRepository.updateCard(updated);
    await FlashDeckRepository.insertReviewLog({
      id: createId('flash_log'),
      cardId: card.id,
      rating,
      previousInterval,
      newInterval: updated.intervalDays,
      reviewedAt: patch.lastReviewedAt ?? new Date().toISOString(),
      sessionId: sessionId ?? null,
      durationMs: null,
    });

    const lemmaKey = updated.lemma ?? normalizeLemma(updated.front);
    if (lemmaKey) {
      await LemmaCompetenceService.recordFlashReview(lemmaKey, rating);
    }

    return updated;
  },
};
