import { RoutineCategory, type RoutineCategoryValue, type RoutineRewards } from '@/types/routine';

import type { RoutineTemplate } from '../catalogs/routine-templates';

const BASE_BY_CATEGORY: Record<RoutineCategoryValue, RoutineRewards> = {
  [RoutineCategory.ENGLISH_COURSE]: { xp: 30, coins: 15, studyPoints: 4 },
  [RoutineCategory.SPEAKING]: { xp: 28, coins: 14, studyPoints: 5 },
  [RoutineCategory.READING]: { xp: 22, coins: 12, studyPoints: 3 },
  [RoutineCategory.VOCABULARY]: { xp: 18, coins: 10, studyPoints: 3 },
  [RoutineCategory.LISTENING]: { xp: 20, coins: 11, studyPoints: 3 },
  [RoutineCategory.WRITING]: { xp: 22, coins: 12, studyPoints: 3 },
  [RoutineCategory.GRAMMAR]: { xp: 20, coins: 10, studyPoints: 2 },
  [RoutineCategory.CAREER]: { xp: 32, coins: 16, studyPoints: 4 },
  [RoutineCategory.PROGRAMMING_ENGLISH]: { xp: 24, coins: 12, studyPoints: 3 },
  [RoutineCategory.PERSONAL]: { xp: 15, coins: 8, studyPoints: 2 },
};

const FREQUENCY_MULTIPLIER = {
  daily: 1,
  custom: 1,
  weekly: 1.4,
  monthly: 2,
} as const;

export const resolveRoutineRewards = (
  routine: {
    category: RoutineCategoryValue;
    frequency: keyof typeof FREQUENCY_MULTIPLIER;
    customXp: number | null;
    customCoins: number | null;
  },
  template?: RoutineTemplate | null,
): RoutineRewards => {
  if (routine.customXp != null && routine.customCoins != null) {
    const mult = FREQUENCY_MULTIPLIER[routine.frequency] ?? 1;
    return {
      xp: Math.round(routine.customXp * mult),
      coins: Math.round(routine.customCoins * mult),
      studyPoints: Math.max(2, Math.round((routine.customXp / 10) * mult)),
    };
  }

  if (template) {
    const mult = FREQUENCY_MULTIPLIER[routine.frequency] ?? 1;
    return {
      xp: Math.round(template.defaultXp * mult),
      coins: Math.round(template.defaultCoins * mult),
      studyPoints: Math.max(2, Math.round(template.defaultXp / 8)),
    };
  }

  const base = BASE_BY_CATEGORY[routine.category] ?? BASE_BY_CATEGORY[RoutineCategory.PERSONAL];
  const mult = FREQUENCY_MULTIPLIER[routine.frequency] ?? 1;
  return {
    xp: Math.round(base.xp * mult),
    coins: Math.round(base.coins * mult),
    studyPoints: Math.round(base.studyPoints * mult),
  };
};
