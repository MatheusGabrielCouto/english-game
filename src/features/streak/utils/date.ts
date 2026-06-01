import { getTodayKey } from '@/features/quests/utils/date';

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const addDaysToDateKey = (dateKey: string, days: number): string => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

export const getYesterdayKey = (today = getTodayKey()): string =>
  addDaysToDateKey(today, -1);

export const diffDays = (fromKey: string, toKey: string): number => {
  const from = parseDateKey(fromKey).getTime();
  const to = parseDateKey(toKey).getTime();
  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
};

export const isToday = (dateKey: string, today = getTodayKey()): boolean =>
  dateKey === today;

export const isYesterday = (dateKey: string, today = getTodayKey()): boolean =>
  dateKey === getYesterdayKey(today);

export type MonthBounds = {
  year: number;
  month: number;
  startDate: string;
  endDate: string;
};

export const getMonthBounds = (year: number, month: number): MonthBounds => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  return {
    year,
    month,
    startDate: toDateKey(start),
    endDate: toDateKey(end),
  };
};

export const getCalendarGridDays = (year: number, month: number): (string | null)[] => {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const grid: (string | null)[] = Array.from({ length: startOffset }, () => null);

  for (let day = 1; day <= daysInMonth; day += 1) {
    grid.push(toDateKey(new Date(year, month - 1, day)));
  }

  while (grid.length % 7 !== 0) {
    grid.push(null);
  }

  return grid;
};

export const formatStudyDateLabel = (dateKey: string): string => {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
};

export const formatMonthLabel = (year: number, month: number): string => {
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};
