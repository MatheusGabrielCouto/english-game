import { JournalEntryType, type JournalEntryTypeValue } from '@/types/journal';

export const JOURNAL_XP = {
  createNote: 20,
  lessonSummary: 30,
  reviewNote: 10,
  replayVoice: 5,
} as const;

export const resolveCreateXp = (entryType: JournalEntryTypeValue): number => {
  if (entryType === JournalEntryType.LESSON_SUMMARY) {
    return JOURNAL_XP.lessonSummary;
  }
  return JOURNAL_XP.createNote;
};
