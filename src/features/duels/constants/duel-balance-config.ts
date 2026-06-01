import type { DuelPatent } from '@/types/duel';
import { DUEL_PATENT_ORDER } from '@/types/duel';

/** Caps de moedas por duelo ranqueado (M8 balance). */
export const DUEL_DAILY_COIN_CAP = 120;
export const DUEL_WEEKLY_BOSS_COIN_BONUS = 35;

export const DUEL_QUESTION_TIMER_SEC = 15;

const B1_PLUS_PATENTS: DuelPatent[] = ['intern', 'analyst', 'ambassador', 'fluent'];

export const duelUsesQuestionTimer = (patent: DuelPatent): boolean =>
  B1_PLUS_PATENTS.includes(patent);

export const getPatentCoinCapMultiplier = (patent: DuelPatent): number => {
  const index = DUEL_PATENT_ORDER.indexOf(patent);
  return 1 + index * 0.08;
};
