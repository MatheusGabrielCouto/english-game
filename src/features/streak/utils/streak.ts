import { addDaysToDateKey } from './date';

export const isStreakStillActive = (
  lastStudyDate: string | null,
  today: string,
): boolean => {
  if (!lastStudyDate) return false;
  if (lastStudyDate === today) return true;
  return lastStudyDate === addDaysToDateKey(today, -1);
};

export const shouldResetStreak = (
  lastStudyDate: string | null,
  today: string,
): boolean => {
  if (!lastStudyDate) return false;
  return !isStreakStillActive(lastStudyDate, today);
};

export const calculateStreakAfterStudy = (
  lastStudyDate: string | null,
  currentStreak: number,
  today: string,
): number => {
  if (lastStudyDate === today) return currentStreak;
  if (lastStudyDate === addDaysToDateKey(today, -1)) return currentStreak + 1;
  return 1;
};

export const calculateBestStreak = (bestStreak: number, currentStreak: number): number =>
  Math.max(bestStreak, currentStreak);
