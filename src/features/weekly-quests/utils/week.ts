export type WeekBounds = {
  weekStartDate: string;
  weekEndDate: string;
};

const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Semana começa na segunda-feira (ISO-like). */
export const getWeekBounds = (date = new Date()): WeekBounds => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() + diffToMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return {
    weekStartDate: toDateKey(weekStart),
    weekEndDate: toDateKey(weekEnd),
  };
};

export const isSameWeek = (dateA: string, dateB: string): boolean => {
  const { weekStartDate: startA } = getWeekBounds(new Date(`${dateA}T12:00:00`));
  const { weekStartDate: startB } = getWeekBounds(new Date(`${dateB}T12:00:00`));
  return startA === startB;
};
