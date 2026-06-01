import type { Mission } from '@/types/mission';

export const LEARNING_DAILY_TEMPLATE_KEYS = {
  duelWin: 'learning_daily_duel_win',
  flashReview5: 'learning_daily_flash_review_5',
  duelFlawless: 'learning_daily_duel_flawless',
} as const;

export const findIncompleteMissionByTemplateKey = (
  missions: Mission[],
  templateKey: string,
): Mission | undefined =>
  missions.find((mission) => mission.templateKey === templateKey && !mission.completed);

export const shouldAutoCompleteFlashMission = (
  cardsReviewed: number,
  threshold = 5,
): boolean => cardsReviewed >= threshold;

export const shouldAutoCompleteDuelWinMission = (won: boolean, mode: string): boolean =>
  won && mode !== 'patent_exam' && mode !== 'rematch_review';

export const shouldAutoCompleteFlawlessMission = (won: boolean, flawless: boolean): boolean =>
  won && flawless;
