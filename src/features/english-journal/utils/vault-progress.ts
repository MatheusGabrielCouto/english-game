import type { JournalStatsRecord } from '@/types/journal';

export const VAULT_KP = {
  createNote: 5,
  lessonSummary: 8,
  link: 3,
  review: 8,
  collectionAdd: 2,
} as const;

export const computeKnowledgeLevel = (points: number): number =>
  Math.max(1, Math.floor(Math.sqrt(points / 12)) + 1);

export const computeLibraryTier = (points: number): number => Math.min(10, Math.floor(points / 100));

export const computeMasteryBps = (reviews: number, entries: number): number => {
  if (entries <= 0) return 0;
  return Math.min(10_000, Math.round((reviews / entries) * 10_000));
};

export const applyKnowledgePoints = (
  stats: JournalStatsRecord,
  delta: number,
): JournalStatsRecord => {
  const knowledgePoints = Math.max(0, stats.knowledgePoints + delta);
  const knowledgeLevel = computeKnowledgeLevel(knowledgePoints);
  const libraryTier = computeLibraryTier(knowledgePoints);
  const knowledgeMasteryBps = computeMasteryBps(stats.totalReviews, stats.totalEntries);
  return {
    ...stats,
    knowledgePoints,
    knowledgeLevel,
    libraryTier,
    knowledgeMasteryBps,
    knowledgeProgress: stats.totalEntries,
    updatedAt: new Date().toISOString(),
  };
};
