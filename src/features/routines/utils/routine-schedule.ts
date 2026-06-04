import { getTodayKey } from '@/features/quests/utils/date';
import {
    RoutineFrequency,
    type RoutineConsistencyLabel,
    type RoutineFrequencyValue,
    type UserRoutineRecord,
} from '@/types/routine';

const pad2 = (n: number) => String(n).padStart(2, '0');

export const parseWeekdaysJson = (json: string): number[] => {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is number => typeof v === 'number' && v >= 0 && v <= 6);
  } catch {
    return [];
  }
};

export const serializeWeekdays = (weekdays: number[]): string =>
  JSON.stringify([...new Set(weekdays)].sort((a, b) => a - b));

export const mapRoutineRow = (row: {
  id: string;
  name: string;
  description: string | null;
  category: string;
  frequency: string;
  reminderTime: string | null;
  weekdaysJson: string;
  expectedDurationMin: number | null;
  customXp: number | null;
  customCoins: number | null;
  templateKey: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}): UserRoutineRecord => ({
  id: row.id,
  name: row.name,
  description: row.description,
  category: row.category as UserRoutineRecord['category'],
  frequency: row.frequency as RoutineFrequencyValue,
  reminderTime: row.reminderTime,
  weekdays: parseWeekdaysJson(row.weekdaysJson),
  expectedDurationMin: row.expectedDurationMin,
  customXp: row.customXp,
  customCoins: row.customCoins,
  templateKey: row.templateKey,
  isArchived: row.isArchived,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

const dateFromKey = (dateKey: string): Date => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const dateKeyFromDate = (date: Date): string =>
  `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;

export const addDaysUtc = (dateKey: string, days: number): string => {
  const date = dateFromKey(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return dateKeyFromDate(date);
};

/** ISO week key: YYYY-Www */
export const getWeekPeriodKey = (dateKey = getTodayKey()): string => {
  const date = dateFromKey(dateKey);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${pad2(week)}`;
};

export const getMonthPeriodKey = (dateKey = getTodayKey()): string => {
  const [y, m] = dateKey.split('-');
  return `${y}-${m}`;
};

export const getPeriodKey = (
  frequency: RoutineFrequencyValue,
  dateKey = getTodayKey(),
): string => {
  switch (frequency) {
    case RoutineFrequency.WEEKLY:
      return getWeekPeriodKey(dateKey);
    case RoutineFrequency.MONTHLY:
      return getMonthPeriodKey(dateKey);
    case RoutineFrequency.DAILY:
    case RoutineFrequency.CUSTOM:
    default:
      return dateKey;
  }
};

const matchesWeekday = (routine: UserRoutineRecord, dateKey: string): boolean => {
  if (routine.weekdays.length === 0) return true;
  const day = dateFromKey(dateKey).getUTCDay();
  return routine.weekdays.includes(day);
};

export const isRoutineDueOnDate = (
  routine: UserRoutineRecord,
  dateKey = getTodayKey(),
): boolean => {
  if (routine.isArchived) return false;

  switch (routine.frequency) {
    case RoutineFrequency.DAILY:
    case RoutineFrequency.CUSTOM:
      return matchesWeekday(routine, dateKey);
    case RoutineFrequency.WEEKLY:
      return matchesWeekday(routine, dateKey);
    case RoutineFrequency.MONTHLY:
      if (!matchesWeekday(routine, dateKey)) {
        const dayOfMonth = dateFromKey(dateKey).getUTCDate();
        if (routine.weekdays.length > 0) return false;
        return dayOfMonth === 1;
      }
      return true;
    default:
      return false;
  }
};

export const getPreviousPeriodKey = (
  frequency: RoutineFrequencyValue,
  periodKey: string,
): string | null => {
  switch (frequency) {
    case RoutineFrequency.DAILY:
    case RoutineFrequency.CUSTOM:
      return addDaysUtc(periodKey, -1);
    case RoutineFrequency.WEEKLY: {
      const match = periodKey.match(/^(\d{4})-W(\d{2})$/);
      if (!match) return null;
      let year = Number(match[1]);
      let week = Number(match[2]) - 1;
      if (week < 1) {
        year -= 1;
        week = 52;
      }
      return `${year}-W${pad2(week)}`;
    }
    case RoutineFrequency.MONTHLY: {
      const [y, m] = periodKey.split('-').map(Number);
      if (m === 1) return `${y - 1}-12`;
      return `${y}-${pad2(m - 1)}`;
    }
    default:
      return null;
  }
};

export const computeStreakAfterComplete = (
  frequency: RoutineFrequencyValue,
  lastCompletedPeriod: string | null,
  currentPeriod: string,
  currentStreak: number,
): number => {
  if (!lastCompletedPeriod) return 1;

  const previous = getPreviousPeriodKey(frequency, currentPeriod);
  if (previous && lastCompletedPeriod === previous) {
    return currentStreak + 1;
  }
  if (lastCompletedPeriod === currentPeriod) {
    return currentStreak;
  }
  return 1;
};

export const computeCompletionRate = (
  totalCompleted: number,
  totalMissed: number,
): number => {
  const total = totalCompleted + totalMissed;
  if (total === 0) return 0;
  return Math.round((totalCompleted / total) * 100);
};

export const getConsistencyLabel = (rate: number): RoutineConsistencyLabel => {
  if (rate >= 90) return 'excellent';
  if (rate >= 70) return 'good';
  if (rate >= 50) return 'fair';
  return 'poor';
};

export const streakUnitLabel = (frequency: RoutineFrequencyValue): string => {
  switch (frequency) {
    case RoutineFrequency.WEEKLY:
      return 'semanas';
    case RoutineFrequency.MONTHLY:
      return 'meses';
    default:
      return 'dias';
  }
};
