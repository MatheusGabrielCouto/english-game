import type { JournalEntryRecord } from '@/types/journal'

import { isReviewDue } from './journal-review'

export const filterDueReviewEntries = (
  entries: readonly JournalEntryRecord[],
  nowMs: number = Date.now(),
): JournalEntryRecord[] =>
  entries.filter((entry) => isReviewDue(entry.nextReviewAt, nowMs))
