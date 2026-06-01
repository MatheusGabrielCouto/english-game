import type { DuelPatent } from '@/types/duel';

import { DUEL_QUESTION_TIMER_SEC, duelUsesQuestionTimer } from '../constants/duel-balance-config';

export const resolveQuestionTimeLimitSec = (patent: DuelPatent): number | null =>
  duelUsesQuestionTimer(patent) ? DUEL_QUESTION_TIMER_SEC : null;
