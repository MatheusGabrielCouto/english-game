import type { FlashCardRecord } from '@/types/flash-card';
import { DEFAULT_FLASH_DECK_ID } from '@/types/flash-card';

import { FlashDeckService } from '../services/flash-deck-service';

export type FlashReviewScope = 'deck' | 'all';

export type FlashReviewRouteParams = {
  deckId?: string;
  scope?: string;
};

export const resolveFlashReviewParams = (
  params: FlashReviewRouteParams,
): { scope: FlashReviewScope; deckId: string } => {
  const deckId = params.deckId?.trim() || DEFAULT_FLASH_DECK_ID;
  if (params.scope === 'all') {
    return { scope: 'all', deckId };
  }
  return { scope: 'deck', deckId };
};

export const loadFlashReviewQueue = async (
  scope: FlashReviewScope,
  deckId: string,
): Promise<FlashCardRecord[]> => {
  if (scope === 'all') {
    return FlashDeckService.listDueCardsForHubReview();
  }
  return FlashDeckService.listDueCards(deckId);
};

export const sessionDeckIdForReview = (
  scope: FlashReviewScope,
  deckId: string,
  queue: FlashCardRecord[],
): string => (scope === 'all' ? (queue[0]?.deckId ?? deckId) : deckId);
