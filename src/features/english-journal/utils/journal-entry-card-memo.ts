import type { JournalEntryRecord } from '@/types/journal'

/** Fields that affect JournalEntryCard visuals (P-40). */
export const hasSameJournalEntryCardSnapshot = (
  prev: JournalEntryRecord,
  next: JournalEntryRecord,
): boolean =>
  prev.id === next.id &&
  prev.updatedAt === next.updatedAt &&
  prev.isFavorite === next.isFavorite &&
  prev.isPinned === next.isPinned &&
  prev.nextReviewAt === next.nextReviewAt &&
  prev.title === next.title &&
  prev.body === next.body &&
  prev.audioUri === next.audioUri &&
  prev.images.length === next.images.length
