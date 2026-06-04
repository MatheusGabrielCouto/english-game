export const JournalEntryType = {
  VOICE_NOTE: 'voice_note',
  TEXT_NOTE: 'text_note',
  QUICK_NOTE: 'quick_note',
  LESSON_SUMMARY: 'lesson_summary',
  TEACHER_FEEDBACK: 'teacher_feedback',
  INTERVIEW_NOTES: 'interview_notes',
  INTERVIEW_NOTE: 'interview_note',
  PROGRAMMING_ENGLISH: 'programming_english',
  VOCABULARY_ENTRY: 'vocabulary_entry',
  GRAMMAR_ENTRY: 'grammar_entry',
  PROGRAMMING_CONCEPT: 'programming_concept',
} as const;

export type JournalEntryTypeValue =
  (typeof JournalEntryType)[keyof typeof JournalEntryType];

export const JournalCategory = {
  VOCABULARY: 'vocabulary',
  GRAMMAR: 'grammar',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  READING: 'reading',
  WRITING: 'writing',
  INTERVIEW: 'interview',
  CAREER: 'career',
  PROGRAMMING_ENGLISH: 'programming_english',
  PERSONAL: 'personal',
} as const;

export type JournalCategoryValue =
  (typeof JournalCategory)[keyof typeof JournalCategory];

export const JournalImportance = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type JournalImportanceValue =
  (typeof JournalImportance)[keyof typeof JournalImportance];

export type JournalEntryRecord = {
  id: string;
  entryType: JournalEntryTypeValue;
  title: string;
  body: string | null;
  category: JournalCategoryValue;
  importance: JournalImportanceValue;
  tags: string[];
  audioUri: string | null;
  audioDurationMs: number | null;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  spaceKey: string;
  folderId: string | null;
  reviewStage: number;
  reviewCount: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type JournalStatsRecord = {
  totalEntries: number;
  totalVoiceNotes: number;
  totalTextNotes: number;
  totalReviews: number;
  totalVoiceMs: number;
  totalXpFromJournal: number;
  knowledgeProgress: number;
  knowledgePoints: number;
  knowledgeLevel: number;
  knowledgeMasteryBps: number;
  totalConnections: number;
  totalCollections: number;
  libraryTier: number;
  updatedAt: string;
};

export type JournalReviewStage = 0 | 1 | 2 | 3 | 4;

export type JournalListFilter = {
  category?: JournalCategoryValue | 'all';
  importance?: JournalImportanceValue | 'all';
  favoritesOnly?: boolean;
  pinnedOnly?: boolean;
  entryType?: JournalEntryTypeValue | 'all';
  search?: string;
  spaceKey?: string | 'all';
  folderId?: string | 'all';
  collectionId?: string | 'all';
};
