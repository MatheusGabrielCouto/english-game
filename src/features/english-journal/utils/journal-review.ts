const DAY_MS = 24 * 60 * 60 * 1000;

const REVIEW_INTERVALS_DAYS = [1, 3, 7, 30] as const;

export const scheduleFirstReviewAt = (fromMs = Date.now()): string =>
  new Date(fromMs + REVIEW_INTERVALS_DAYS[0] * DAY_MS).toISOString();

export const scheduleNextReviewAfterStage = (
  stage: number,
  fromMs = Date.now(),
): string | null => {
  const index = stage;
  if (index < 0 || index >= REVIEW_INTERVALS_DAYS.length) {
    return null;
  }
  const days = REVIEW_INTERVALS_DAYS[index];
  return new Date(fromMs + days * DAY_MS).toISOString();
};

export const getReviewMessageForStage = (stage: number): string => {
  if (stage <= 0) return 'Review this note again.';
  if (stage === 1) return 'Review this note again.';
  if (stage === 2) return 'Do you still remember this?';
  if (stage === 3) return "Let's reinforce this knowledge.";
  return 'Long-term memory review.';
};

export const isReviewDue = (nextReviewAt: string | null, nowMs = Date.now()): boolean => {
  if (!nextReviewAt) return false;
  return new Date(nextReviewAt).getTime() <= nowMs;
};

export const formatNextReviewLabel = (nextReviewAt: string | null, nowMs = Date.now()): string => {
  if (!nextReviewAt) return 'Revisões espaçadas concluídas para esta nota';
  const diffMs = new Date(nextReviewAt).getTime() - nowMs;
  const days = Math.ceil(diffMs / DAY_MS);
  if (days <= 0) return 'Próxima revisão em breve';
  if (days === 1) return 'Próxima revisão amanhã';
  return `Próxima revisão em ${days} dias`;
};

export const normalizeTagsInput = (raw: string): string[] =>
  raw
    .split(/[\s,]+/)
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0)
    .slice(0, 12);
