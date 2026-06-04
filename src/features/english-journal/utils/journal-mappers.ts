import type { journalCollections, journalEntries, journalFolders } from '@/storage/database/schema';
import type { JournalEntryRecord } from '@/types/journal';
import type { VaultCollectionRecord, VaultFolderRecord, VaultSpaceKey } from '@/types/knowledge-vault';

export const parseTagsJson = (raw: string): string[] => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);
  } catch {
    return [];
  }
};

export const serializeTags = (tags: string[]): string => JSON.stringify(tags);

export const normalizeTag = (tag: string): string =>
  tag.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-');

export const mapJournalRow = (row: typeof journalEntries.$inferSelect): JournalEntryRecord => ({
  id: row.id,
  entryType: row.entryType as JournalEntryRecord['entryType'],
  title: row.title,
  body: row.body,
  category: row.category as JournalEntryRecord['category'],
  importance: row.importance as JournalEntryRecord['importance'],
  tags: parseTagsJson(row.tagsJson),
  audioUri: row.audioUri,
  audioDurationMs: row.audioDurationMs,
  isFavorite: row.isFavorite,
  isPinned: row.isPinned ?? false,
  isArchived: row.isArchived,
  spaceKey: row.spaceKey ?? 'personal_notes',
  folderId: row.folderId,
  reviewStage: row.reviewStage,
  reviewCount: row.reviewCount,
  nextReviewAt: row.nextReviewAt,
  lastReviewedAt: row.lastReviewedAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

export const mapFolderRow = (row: typeof journalFolders.$inferSelect): VaultFolderRecord => ({
  id: row.id,
  spaceKey: row.spaceKey as VaultSpaceKey,
  parentId: row.parentId,
  name: row.name,
  slug: row.slug,
  sortOrder: row.sortOrder,
  createdAt: row.createdAt,
});

export const mapCollectionRow = (
  row: typeof journalCollections.$inferSelect,
  entryCount = 0,
): VaultCollectionRecord => ({
  id: row.id,
  name: row.name,
  description: row.description,
  emoji: row.emoji,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  entryCount,
});
