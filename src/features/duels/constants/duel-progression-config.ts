import type { DuelPatent } from '@/types/duel';
import { DUEL_PATENT_ORDER } from '@/types/duel';

export type DuelArenaMode =
  | 'ranked'
  | 'dojo'
  | 'patent_exam'
  | 'rematch_review'
  | 'card_duel'
  | 'weekly_boss';

export const DUEL_PROGRESSION_CONFIG = {
  maxStamina: 5,
  staminaRegenHours: 4,
  dailyRankedCap: 5,
  dojoXpMultiplier: 0.5,
  patentExamQuestionCount: 15,
  patentExamPassRatio: 0.8,
  rematchReviewMaxQuestions: 3,
  weeklyBossQuestionCount: 8,
} as const;

export const getNextPatent = (current: DuelPatent): DuelPatent | null => {
  const index = DUEL_PATENT_ORDER.indexOf(current);
  if (index < 0 || index >= DUEL_PATENT_ORDER.length - 1) return null;
  return DUEL_PATENT_ORDER[index + 1] ?? null;
};

export const DUEL_CARD_DUEL_QUESTION_COUNT = 5;

export const DUEL_ARENA_KEYS: Record<DuelArenaMode, string> = {
  ranked: 'coliseum_ranked',
  dojo: 'dojo',
  patent_exam: 'patent_exam',
  rematch_review: 'rematch_review',
  card_duel: 'card_duel_bridge',
  weekly_boss: 'coliseum_weekly_boss',
};

/** Ranked duels at Morador+ skip pacotes só A1. */
export const usesA1TravelPack = (patent: DuelPatent): boolean => patent === 'tourist';
