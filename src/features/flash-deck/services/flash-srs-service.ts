import type { FlashCardRecord, FlashCardState, FlashSrsRating } from '@/types/flash-card';

import { FLASH_SRS_CONFIG } from '../constants/flash-srs-config';

const { minEaseFactor, againMinutes, matureIntervalDays, leechLapseThreshold, secondIntervalDays } =
  FLASH_SRS_CONFIG;

const QUALITY: Record<FlashSrsRating, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

const addDays = (from: Date, days: number): Date => {
  const result = new Date(from);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const addMinutes = (from: Date, minutes: number): Date =>
  new Date(from.getTime() + minutes * 60 * 1000);

const updateEaseFactor = (easeFactor: number, quality: number): number => {
  const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  return Math.max(minEaseFactor, Math.round((easeFactor + delta) * 100) / 100);
};

export type FlashSrsPatch = Pick<
  FlashCardRecord,
  | 'easeFactor'
  | 'intervalDays'
  | 'repetitions'
  | 'lapseCount'
  | 'dueAt'
  | 'lastReviewedAt'
  | 'state'
>;

export const FlashSrsService = {
  isLeech(card: Pick<FlashCardRecord, 'lapseCount'>): boolean {
    return card.lapseCount >= leechLapseThreshold;
  },

  resolveState(
    card: Pick<FlashCardRecord, 'intervalDays' | 'repetitions' | 'lapseCount' | 'state'>,
  ): FlashCardState {
    if (card.state === 'new' && card.repetitions === 0 && card.intervalDays === 0) {
      return 'new';
    }
    if (card.lapseCount > 0 && card.intervalDays < 1) {
      return 'relearning';
    }
    if (card.intervalDays >= matureIntervalDays) {
      return 'mature';
    }
    if (card.intervalDays < 1) {
      return 'learning';
    }
    return 'review';
  },

  initialFields(now = new Date()): Pick<
    FlashCardRecord,
    'state' | 'dueAt' | 'intervalDays' | 'repetitions' | 'lapseCount' | 'easeFactor'
  > {
    return {
      state: 'new',
      dueAt: now.toISOString(),
      intervalDays: 0,
      repetitions: 0,
      lapseCount: 0,
      easeFactor: FLASH_SRS_CONFIG.defaultEaseFactor,
    };
  },

  applyRating(card: FlashCardRecord, rating: FlashSrsRating, now = new Date()): FlashSrsPatch {
    const lastReviewedAt = now.toISOString();

    if (rating === 'again') {
      const patch = {
        easeFactor: Math.max(minEaseFactor, Math.round((card.easeFactor - 0.2) * 100) / 100),
        intervalDays: 0,
        repetitions: 0,
        lapseCount: card.lapseCount + 1,
        dueAt: addMinutes(now, againMinutes).toISOString(),
        lastReviewedAt,
        state: 'relearning' as const,
      };
      return patch;
    }

    let easeFactor = updateEaseFactor(card.easeFactor, QUALITY[rating]);
    let intervalDays = card.intervalDays;
    let repetitions = card.repetitions;

    let nextInterval: number;
    if (repetitions === 0) {
      nextInterval = 1;
    } else if (repetitions === 1) {
      nextInterval = secondIntervalDays;
    } else {
      nextInterval = Math.max(1, Math.round(intervalDays * easeFactor));
    }

    if (rating === 'hard') {
      nextInterval = Math.max(1, Math.round(nextInterval / 1.2));
    } else if (rating === 'easy') {
      nextInterval = Math.max(1, Math.round(nextInterval * 1.3));
      easeFactor = Math.min(3, easeFactor + 0.05);
    }

    repetitions += 1;
    intervalDays = nextInterval;
    const dueAt = addDays(now, nextInterval).toISOString();
    const state = FlashSrsService.resolveState({
      intervalDays,
      repetitions,
      lapseCount: card.lapseCount,
      state: card.state,
    });

    return {
      easeFactor,
      intervalDays,
      repetitions,
      lapseCount: card.lapseCount,
      dueAt,
      lastReviewedAt,
      state,
    };
  },
};
