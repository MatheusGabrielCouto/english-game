import {
  FOCUS_DISTRACTION_PENALTY_PER_MIN,
  FOCUS_HARDCORE_PENALTY_PER_MIN,
  FOCUS_MAX_PENALTY,
  FOCUS_SP_PER_FOCUSED_MINUTE,
  FOCUS_STUDY_TYPE_META,
  FOCUS_WORD_SP_BONUS,
  type FocusDurationMinutes,
} from '@/features/focus-mode/constants/focus-config';
import { FOCUS_TIER_BY_DURATION, rollFocusLootRarity } from '@/features/focus-mode/constants/focus-rewards';
import type { FocusSession, FocusSessionRewards, FocusStudyTypeValue } from '@/types/focus-mode';

const FOCUS_LOOT_MIN_COMPLETION_RATIO = 0.85;

export const computeSessionElapsedSeconds = (session: FocusSession): number =>
  session.focusedSeconds +
  session.distractedSeconds +
  session.idleSeconds +
  session.pauseSeconds;

/** Proporção do tempo planejado cumprido (1 = timer zerado ou sessão completa). */
export const computeSessionCompletionRatio = (session: FocusSession): number => {
  if (session.plannedDurationSec <= 0) return 1;
  const elapsed = computeSessionElapsedSeconds(session);
  return Math.min(1, Math.max(0, elapsed / session.plannedDurationSec));
};

export const computeFocusBonusMultiplier = (
  distractedSeconds: number,
  hardcoreMode: boolean,
): number => {
  const distractedMinutes = distractedSeconds / 60;
  const rate = hardcoreMode ? FOCUS_HARDCORE_PENALTY_PER_MIN : FOCUS_DISTRACTION_PENALTY_PER_MIN;
  const penalty = Math.min(FOCUS_MAX_PENALTY, distractedMinutes * rate);
  return Math.max(0.5, 1 - penalty);
};

export const computeFocusRewards = (input: {
  session: FocusSession;
  durationMinutes: FocusDurationMinutes;
  hardcoreMode: boolean;
}): FocusSessionRewards => {
  const { session, durationMinutes, hardcoreMode } = input;
  const tier = FOCUS_TIER_BY_DURATION[durationMinutes];
  const bonusMultiplier = computeFocusBonusMultiplier(session.distractedSeconds, hardcoreMode);
  const focusedMinutes = Math.max(1, Math.floor(session.focusedSeconds / 60));
  const studyMeta = FOCUS_STUDY_TYPE_META[session.studyType as FocusStudyTypeValue];

  const focusRatio =
    session.focusedSeconds + session.distractedSeconds > 0
      ? session.focusedSeconds / (session.focusedSeconds + session.distractedSeconds)
      : 1;

  const completionRatio = computeSessionCompletionRatio(session);

  const xp = Math.round(
    tier.baseXp * bonusMultiplier * Math.min(1, focusRatio + 0.25) * completionRatio,
  );
  const coins = Math.round(
    tier.baseCoins * bonusMultiplier * Math.min(1, focusRatio + 0.2) * completionRatio,
  );
  const studyPoints =
    Math.round(focusedMinutes * (FOCUS_SP_PER_FOCUSED_MINUTE + studyMeta.spPerMinute) * bonusMultiplier) +
    session.wordsLearned * FOCUS_WORD_SP_BONUS;

  const lootBoxRarity =
    focusRatio >= 0.6 && completionRatio >= FOCUS_LOOT_MIN_COMPLETION_RATIO
      ? rollFocusLootRarity(durationMinutes)
      : null;

  const basePetAffinity = focusRatio >= 0.75 ? 12 : focusRatio >= 0.5 ? 6 : 0;
  const petAffinityGain = Math.round(basePetAffinity * completionRatio);

  return {
    xp,
    coins,
    studyPoints,
    bonusMultiplier,
    lootBoxRarity,
    petAffinityGain,
    focusRatio,
    completionRatio,
  };
};

export const plannedMinutesFromSession = (session: FocusSession): FocusDurationMinutes => {
  const minutes = Math.round(session.plannedDurationSec / 60);
  if (minutes >= 90) return 90;
  if (minutes >= 60) return 60;
  if (minutes >= 30) return 30;
  return 15;
};
