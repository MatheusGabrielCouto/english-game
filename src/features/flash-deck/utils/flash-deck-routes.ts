import type { Href } from 'expo-router';

const ALL_DECKS_SCOPE = 'scope=all';

export const flashDeckRoutes = {
  hub: '/flash-deck' as Href,
  deck: (deckId: string) => `/flash-deck/deck/${deckId}` as Href,
  card: (cardId: string) => `/flash-deck/card/${cardId}` as Href,
  createCard: (deckId: string) => `/flash-deck/create?deckId=${encodeURIComponent(deckId)}` as Href,
  review: (deckId: string) => `/flash-deck/review?deckId=${encodeURIComponent(deckId)}` as Href,
  reviewAll: `/flash-deck/review?${ALL_DECKS_SCOPE}` as Href,
  importCsv: (deckId: string) => `/flash-deck/import?deckId=${encodeURIComponent(deckId)}` as Href,
  mcqReview: (deckId: string) => `/flash-deck/mcq?deckId=${encodeURIComponent(deckId)}` as Href,
  mcqReviewAll: `/flash-deck/mcq?${ALL_DECKS_SCOPE}` as Href,
  blitz: (deckId: string) => `/flash-deck/blitz?deckId=${encodeURIComponent(deckId)}` as Href,
  blitzAll: `/flash-deck/blitz?${ALL_DECKS_SCOPE}` as Href,
};
