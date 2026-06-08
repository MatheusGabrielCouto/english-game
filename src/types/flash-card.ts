export type FlashCardSource =
  | 'user'
  | 'duel_suggest'
  | 'farm'
  | 'import'
  | 'pack'
  | 'mentor';

export type FlashCardState =
  | 'new'
  | 'learning'
  | 'review'
  | 'relearning'
  | 'mature';

export type FlashSrsRating = 'again' | 'hard' | 'good' | 'easy';

export type FlashStudyMode =
  | 'classic'
  | 'recognition_mcq'
  | 'production'
  | 'blitz'
  | 'duel_bridge'
  | 'dream';

export type FlashDeckRecord = {
  id: string;
  name: string;
  description: string | null;
  coverEmoji: string | null;
  sortOrder: number;
  newPerDay: number;
  reviewCap: number;
  createdAt: string;
  archivedAt: string | null;
};

export type FlashCardRecord = {
  id: string;
  deckId: string;
  lemma: string | null;
  front: string;
  back: string;
  exampleSentence: string | null;
  audioUri: string | null;
  imageUri: string | null;
  tags: string[];
  source: FlashCardSource;
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapseCount: number;
  dueAt: string;
  state: FlashCardState;
  lastReviewedAt: string | null;
  createdAt: string;
  suspended: boolean;
};

export type FlashReviewLogRecord = {
  id: string;
  cardId: string;
  rating: FlashSrsRating;
  previousInterval: number | null;
  newInterval: number | null;
  reviewedAt: string;
  sessionId: string | null;
  durationMs: number | null;
};

export type FlashStudySessionRecord = {
  id: string;
  deckId: string | null;
  mode: FlashStudyMode;
  cardsReviewed: number;
  startedAt: string;
  endedAt: string | null;
};

export const DEFAULT_FLASH_DECK_ID = 'deck_default';

export const INTERVIEW_TECH_DECK_ID = 'deck_interview_tech';
