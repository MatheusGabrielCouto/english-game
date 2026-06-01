const dayKey = (date: Date): string => date.toISOString().slice(0, 10);

const previousDayKey = (dateKey: string): string => {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return dayKey(date);
};

/** Dias consecutivos com revisão, contando a partir de hoje ou ontem */
export const computeReviewStreakDays = (
  reviewDateKeys: string[],
  now = new Date(),
): number => {
  if (reviewDateKeys.length === 0) return 0;

  const set = new Set(reviewDateKeys);
  const today = dayKey(now);
  const yesterday = previousDayKey(today);

  let cursor = set.has(today) ? today : set.has(yesterday) ? yesterday : null;
  if (!cursor) return 0;

  let streak = 0;
  while (cursor && set.has(cursor)) {
    streak += 1;
    cursor = previousDayKey(cursor);
  }

  return streak;
};
