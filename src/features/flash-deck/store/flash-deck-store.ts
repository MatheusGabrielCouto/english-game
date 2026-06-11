import { create } from 'zustand';

import { shouldSkipHydratedStoreReread } from '@/storage/startup-read-policy';
import type { FlashCardRecord } from '@/types/flash-card';

import type { FlashDeckListItem, FlashDeckStats } from '../services/flash-deck-service';
import { FlashDeckService } from '../services/flash-deck-service';

const emptyStats = (): FlashDeckStats => ({
  newCount: 0,
  learningCount: 0,
  dueCount: 0,
  matureCount: 0,
  leechCount: 0,
  reviewStreakDays: 0,
  reviewsToday: 0,
  reviewsRemainingToday: 0,
  newCardsCreatedToday: 0,
  newCardsRemainingToday: 10,
});

type FlashDeckState = {
  decks: FlashDeckListItem[];
  totalDueCount: number;
  activeDeckId: string | null;
  activeDeckStats: FlashDeckStats;
  dueCards: FlashCardRecord[];
  isLoading: boolean;
  refresh: (options?: { force?: boolean }) => Promise<void>;
  refreshDeck: (deckId: string) => Promise<FlashDeckStats>;
  loadReviewQueue: (deckId: string) => Promise<FlashCardRecord[]>;
};

export const useFlashDeckStore = create<FlashDeckState>((set, get) => ({
  decks: [],
  totalDueCount: 0,
  activeDeckId: null,
  activeDeckStats: emptyStats(),
  dueCards: [],
  isLoading: true,

  refresh: async (options) => {
    const state = get();
    if (
      !options?.force &&
      shouldSkipHydratedStoreReread(!state.isLoading, { withinFocusGrace: true })
    ) {
      return;
    }

    if (!state.isLoading) {
      set({ isLoading: true });
    }

    try {
      const decks = await FlashDeckService.listDecksWithSummary();
      const totalDueCount = decks.reduce((sum, deck) => sum + deck.dueCount, 0);

      set({
        decks,
        totalDueCount,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  refreshDeck: async (deckId) => {
    const stats = await FlashDeckService.getDeckStats(deckId);
    set({ activeDeckId: deckId, activeDeckStats: stats });
    return stats;
  },

  loadReviewQueue: async (deckId) => {
    const [cards, stats] = await Promise.all([
      FlashDeckService.listDueCards(deckId),
      FlashDeckService.getDeckStats(deckId),
    ]);
    set({
      activeDeckId: deckId,
      activeDeckStats: stats,
      dueCards: cards,
    });
    return cards;
  },
}));
