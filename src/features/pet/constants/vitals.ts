/** 100 = bem alimentado / com energia. Valores baixos bloqueiam ações. */
export const PET_VITAL_THRESHOLDS = {
  MIN_HUNGER_TO_INTERACT: 20,
  MIN_ENERGY_TO_INTERACT: 12,
  MIN_HUNGER_TO_PLAY: 28,
  MIN_ENERGY_TO_PLAY: 22,
  MIN_HUNGER_TO_TRAIN: 35,
  MIN_ENERGY_TO_TRAIN: 38,
  FEED_ALREADY_FULL: 94,
  LOW_WARNING: 35,
  CRITICAL: 18,
} as const;

export const PET_VITAL_DECAY = {
  MAX_STEPS_PER_SYNC: 24,
  ENERGY_PER_STEP: 2,
  HUNGER_PER_STEP: 3,
  HAPPINESS_PER_STEP: 1,
  MOTIVATION_PER_STEP: 1,
  SLEEP_ENERGY_RECOVERY_PER_STEP: 4,
} as const;

export const PET_VITAL_STUDY_BONUS = {
  STUDY_DAY: { hunger: 12, energy: 8, motivation: 6, happiness: 5 },
  FOCUS_SESSION: { hunger: 6, energy: 10, motivation: 8, happiness: 4 },
  DAILY_MISSION: { hunger: 4, energy: 5, motivation: 4, happiness: 3 },
  ROUTINE_COMPLETED: { hunger: 3, energy: 4, motivation: 5, happiness: 6 },
  JOURNAL_ENTRY: { hunger: 2, energy: 3, motivation: 4, happiness: 5 },
  JOURNAL_REVIEW: { hunger: 1, energy: 2, motivation: 3, happiness: 4 },
  ROUTINE_MISSED: { hunger: 0, energy: -2, motivation: -3, happiness: -4 },
} as const;
