import type { DuelPatent } from '@/types/duel';
import { DUEL_PATENT_ORDER } from '@/types/duel';

import { DUEL_PROGRESSION_CONFIG, getNextPatent } from '../constants/duel-progression-config';

export const DuelPatentService = {
  getPatentIndex(patent: DuelPatent): number {
    return DUEL_PATENT_ORDER.indexOf(patent);
  },

  canPromoteTo(current: DuelPatent, target: DuelPatent): boolean {
    const currentIndex = DuelPatentService.getPatentIndex(current);
    const targetIndex = DuelPatentService.getPatentIndex(target);
    return targetIndex === currentIndex + 1;
  },

  getExamTargetPatent(currentPatent: DuelPatent): DuelPatent | null {
    return getNextPatent(currentPatent);
  },

  canTakePatentExam(currentPatent: DuelPatent): boolean {
    return getNextPatent(currentPatent) != null;
  },

  isExamPassed(correctCount: number, total: number): boolean {
    if (total <= 0) return false;
    return correctCount / total >= DUEL_PROGRESSION_CONFIG.patentExamPassRatio;
  },

  resolveHighestPatent(current: DuelPatent, candidate: DuelPatent): DuelPatent {
    return DuelPatentService.getPatentIndex(candidate) > DuelPatentService.getPatentIndex(current)
      ? candidate
      : current;
  },
};
