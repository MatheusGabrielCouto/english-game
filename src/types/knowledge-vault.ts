import type {
    JournalCategoryValue,
    JournalEntryRecord,
    JournalEntryTypeValue,
    JournalImportanceValue,
    JournalStatsRecord,
} from './journal';

export const VaultSpaceKey = {
  GRAMMAR: 'grammar',
  VOCABULARY: 'vocabulary',
  SPEAKING: 'speaking',
  LISTENING: 'listening',
  READING: 'reading',
  WRITING: 'writing',
  INTERVIEW_ENGLISH: 'interview_english',
  PROGRAMMING_ENGLISH: 'programming_english',
  CAREER_ENGLISH: 'career_english',
  TEACHER_FEEDBACK: 'teacher_feedback',
  ENGLISH_COURSE: 'english_course',
  PERSONAL_NOTES: 'personal_notes',
} as const;

export type VaultSpaceKey = (typeof VaultSpaceKey)[keyof typeof VaultSpaceKey];

export type VaultFolderRecord = {
  id: string;
  spaceKey: VaultSpaceKey;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
};

export type VaultCollectionRecord = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  createdAt: string;
  updatedAt: string;
  entryCount?: number;
};

export type VaultEntryRecord = JournalEntryRecord & {
  spaceKey: VaultSpaceKey;
  relatedIds?: string[];
  collectionIds?: string[];
};

export type VaultStatsRecord = JournalStatsRecord;

export type VaultGlobalSearchFilter = {
  query: string;
  spaceKey?: VaultSpaceKey | 'all';
  folderId?: string | 'all';
  collectionId?: string | 'all';
  category?: JournalCategoryValue | 'all';
  tags?: string[];
  entryType?: JournalEntryTypeValue | 'all';
  pinnedOnly?: boolean;
  favoritesOnly?: boolean;
};

export type VaultMapNode = {
  id: string;
  type: 'space' | 'folder' | 'entry';
  label: string;
  emoji?: string;
  spaceKey?: VaultSpaceKey;
  folderId?: string | null;
  entryId?: string;
  children: VaultMapNode[];
  depth: number;
};

export type VaultDashboardSnapshot = {
  stats: VaultStatsRecord;
  dueReviewCount: number;
  pinnedCount: number;
  spaceCount: number;
  topTags: { tag: string; count: number }[];
};

export type VaultReviewBundle = {
  entry: VaultEntryRecord;
  relatedEntries: VaultEntryRecord[];
  message: string;
};

export type KnowledgeGraphNodeType = 'space' | 'folder' | 'entry';

export type KnowledgeGraphEdgeKind = 'hierarchy' | 'relation';

export type KnowledgeGraphReviewStatus = 'ok' | 'due_soon' | 'overdue' | 'none';

export type KnowledgeGraphNode = {
  id: string;
  type: KnowledgeGraphNodeType;
  label: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  spaceKey?: VaultSpaceKey;
  folderId?: string | null;
  entryId?: string;
  reviewStatus: KnowledgeGraphReviewStatus;
  connectionCount: number;
  heat: number;
  entryType?: JournalEntryTypeValue;
  category?: JournalCategoryValue;
  tags: string[];
  createdAt?: string;
};

export type KnowledgeGraphEdge = {
  id: string;
  from: string;
  to: string;
  kind: KnowledgeGraphEdgeKind;
};

export type KnowledgeGraphFilter = {
  spaceKey?: VaultSpaceKey | 'all';
  entryType?: JournalEntryTypeValue | 'all';
  tag?: string | null;
  collectionId?: string | 'all';
};

export type KnowledgeGraphMetrics = {
  totalNotes: number;
  totalConnections: number;
  knowledgeAreas: number;
  mostConnectedTopic: string | null;
  leastExploredArea: string | null;
  reviewsDue: number;
  networkStrength: number;
  brainCompletionPct: number;
  explorerScore: number;
};

export type KnowledgeGraphSnapshot = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  metrics: KnowledgeGraphMetrics;
  canvasWidth: number;
  canvasHeight: number;
};

export type { JournalEntryTypeValue, JournalImportanceValue };
