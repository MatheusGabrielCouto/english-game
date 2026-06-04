import { and, desc, eq, inArray, like, or, sql } from 'drizzle-orm';

import type {
    JournalCategoryValue,
    JournalEntryRecord,
    JournalEntryTypeValue,
    JournalImportanceValue,
    JournalListFilter,
    JournalStatsRecord,
} from '@/types/journal';

import { mapJournalRow, serializeTags } from '@/features/english-journal/utils/journal-mappers';
import { isReviewDue } from '@/features/english-journal/utils/journal-review';
import { VaultRepository } from '@/storage/repositories/vault-repository';
import { getDb } from '../database/client';
import { journalEntries, journalStats } from '../database/schema';

const mapStatsRow = (row: typeof journalStats.$inferSelect): JournalStatsRecord => ({
  totalEntries: row.totalEntries,
  totalVoiceNotes: row.totalVoiceNotes,
  totalTextNotes: row.totalTextNotes,
  totalReviews: row.totalReviews,
  totalVoiceMs: row.totalVoiceMs,
  totalXpFromJournal: row.totalXpFromJournal,
  knowledgeProgress: row.knowledgeProgress,
  knowledgePoints: row.knowledgePoints ?? 0,
  knowledgeLevel: row.knowledgeLevel ?? 1,
  knowledgeMasteryBps: row.knowledgeMasteryBps ?? 0,
  totalConnections: row.totalConnections ?? 0,
  totalCollections: row.totalCollections ?? 0,
  libraryTier: row.libraryTier ?? 0,
  updatedAt: row.updatedAt,
});

const DEFAULT_STATS: JournalStatsRecord = {
  totalEntries: 0,
  totalVoiceNotes: 0,
  totalTextNotes: 0,
  totalReviews: 0,
  totalVoiceMs: 0,
  totalXpFromJournal: 0,
  knowledgeProgress: 0,
  knowledgePoints: 0,
  knowledgeLevel: 1,
  knowledgeMasteryBps: 0,
  totalConnections: 0,
  totalCollections: 0,
  libraryTier: 0,
  updatedAt: new Date().toISOString(),
};

const buildSearchClause = (search: string) => {
  const term = `%${search.trim().toLowerCase()}%`;
  return or(
    like(sql`lower(${journalEntries.title})`, term),
    like(sql`lower(${journalEntries.body})`, term),
    like(sql`lower(${journalEntries.tagsJson})`, term),
    like(sql`lower(${journalEntries.category})`, term),
  );
};

export type CreateJournalEntryRow = {
  id: string;
  entryType: JournalEntryTypeValue;
  title: string;
  body: string | null;
  category: JournalCategoryValue;
  importance: JournalImportanceValue;
  tags: string[];
  audioUri: string | null;
  audioDurationMs: number | null;
  spaceKey: string;
  folderId: string | null;
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const JournalRepository = {
  async findById(id: string): Promise<JournalEntryRecord | null> {
    const db = getDb();
    const rows = await db.select().from(journalEntries).where(eq(journalEntries.id, id)).limit(1);
    return rows[0] ? mapJournalRow(rows[0]) : null;
  },

  async listActive(filter: JournalListFilter = {}): Promise<JournalEntryRecord[]> {
    const db = getDb();
    const conditions = [eq(journalEntries.isArchived, false)];

    if (filter.category && filter.category !== 'all') {
      conditions.push(eq(journalEntries.category, filter.category));
    }
    if (filter.importance && filter.importance !== 'all') {
      conditions.push(eq(journalEntries.importance, filter.importance));
    }
    if (filter.entryType && filter.entryType !== 'all') {
      conditions.push(eq(journalEntries.entryType, filter.entryType));
    }
    if (filter.favoritesOnly) {
      conditions.push(eq(journalEntries.isFavorite, true));
    }
    if (filter.pinnedOnly) {
      conditions.push(eq(journalEntries.isPinned, true));
    }
    if (filter.spaceKey && filter.spaceKey !== 'all') {
      conditions.push(eq(journalEntries.spaceKey, filter.spaceKey));
    }
    if (filter.folderId && filter.folderId !== 'all') {
      conditions.push(eq(journalEntries.folderId, filter.folderId));
    }
    if (filter.collectionId && filter.collectionId !== 'all') {
      const entryIds = await VaultRepository.getEntryIdsForCollection(filter.collectionId);
      if (entryIds.length === 0) return [];
      conditions.push(inArray(journalEntries.id, entryIds));
    }
    if (filter.search?.trim()) {
      conditions.push(buildSearchClause(filter.search)!);
    }

    const rows = await db
      .select()
      .from(journalEntries)
      .where(and(...conditions))
      .orderBy(desc(journalEntries.isPinned), desc(journalEntries.createdAt));

    return rows.map(mapJournalRow);
  },

  async listPinned(limit = 12): Promise<JournalEntryRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.isArchived, false), eq(journalEntries.isPinned, true)))
      .orderBy(desc(journalEntries.updatedAt))
      .limit(limit);
    return rows.map(mapJournalRow);
  },

  async listDueReviews(nowIso = new Date().toISOString()): Promise<JournalEntryRecord[]> {
    const all = await JournalRepository.listActive();
    return all.filter((entry) => isReviewDue(entry.nextReviewAt, new Date(nowIso).getTime()));
  },

  async listFavorites(limit = 8): Promise<JournalEntryRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.isArchived, false), eq(journalEntries.isFavorite, true)))
      .orderBy(desc(journalEntries.updatedAt))
      .limit(limit);
    return rows.map(mapJournalRow);
  },

  async listRecent(limit = 12): Promise<JournalEntryRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.isArchived, false))
      .orderBy(desc(journalEntries.createdAt))
      .limit(limit);
    return rows.map(mapJournalRow);
  },

  async listImportant(limit = 8): Promise<JournalEntryRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.isArchived, false))
      .orderBy(desc(journalEntries.importance), desc(journalEntries.createdAt))
      .limit(limit);
    return rows.map(mapJournalRow);
  },

  async insert(entry: CreateJournalEntryRow): Promise<void> {
    const db = getDb();
    await db.insert(journalEntries).values({
      id: entry.id,
      entryType: entry.entryType,
      title: entry.title,
      body: entry.body,
      category: entry.category,
      importance: entry.importance,
      tagsJson: serializeTags(entry.tags),
      audioUri: entry.audioUri,
      audioDurationMs: entry.audioDurationMs,
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      spaceKey: entry.spaceKey,
      folderId: entry.folderId,
      reviewStage: 0,
      reviewCount: 0,
      nextReviewAt: entry.nextReviewAt,
      lastReviewedAt: null,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    });
  },

  async update(
    id: string,
    patch: Partial<{
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
      updatedAt: string;
    }>,
  ): Promise<void> {
    const db = getDb();
    const { tags, ...rest } = patch;
    await db
      .update(journalEntries)
      .set({
        ...rest,
        ...(tags != null ? { tagsJson: serializeTags(tags) } : {}),
      })
      .where(eq(journalEntries.id, id));
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.delete(journalEntries).where(eq(journalEntries.id, id));
  },

  async countActive(): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(eq(journalEntries.isArchived, false));
    return Number(rows[0]?.count ?? 0);
  },

  async countVoiceNotes(): Promise<number> {
    const db = getDb();
    const rows = await db
      .select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.isArchived, false),
          sql`${journalEntries.audioUri} IS NOT NULL`,
        ),
      );
    return Number(rows[0]?.count ?? 0);
  },

  async getStats(): Promise<JournalStatsRecord> {
    const db = getDb();
    const rows = await db.select().from(journalStats).where(eq(journalStats.id, 1)).limit(1);
    if (rows[0]) return mapStatsRow(rows[0]);

    const now = new Date().toISOString();
    await db.insert(journalStats).values({
      id: 1,
      ...DEFAULT_STATS,
      updatedAt: now,
    });

    return { ...DEFAULT_STATS, updatedAt: now };
  },

  async saveStats(stats: JournalStatsRecord): Promise<void> {
    const db = getDb();
    await db
      .insert(journalStats)
      .values({
        id: 1,
        totalEntries: stats.totalEntries,
        totalVoiceNotes: stats.totalVoiceNotes,
        totalTextNotes: stats.totalTextNotes,
        totalReviews: stats.totalReviews,
        totalVoiceMs: stats.totalVoiceMs,
        totalXpFromJournal: stats.totalXpFromJournal,
        knowledgeProgress: stats.knowledgeProgress,
        knowledgePoints: stats.knowledgePoints,
        knowledgeLevel: stats.knowledgeLevel,
        knowledgeMasteryBps: stats.knowledgeMasteryBps,
        totalConnections: stats.totalConnections,
        totalCollections: stats.totalCollections,
        libraryTier: stats.libraryTier,
        updatedAt: stats.updatedAt,
      })
      .onConflictDoUpdate({
        target: journalStats.id,
        set: {
          totalEntries: stats.totalEntries,
          totalVoiceNotes: stats.totalVoiceNotes,
          totalTextNotes: stats.totalTextNotes,
          totalReviews: stats.totalReviews,
          totalVoiceMs: stats.totalVoiceMs,
          totalXpFromJournal: stats.totalXpFromJournal,
          knowledgeProgress: stats.knowledgeProgress,
          knowledgePoints: stats.knowledgePoints,
          knowledgeLevel: stats.knowledgeLevel,
          knowledgeMasteryBps: stats.knowledgeMasteryBps,
          totalConnections: stats.totalConnections,
          totalCollections: stats.totalCollections,
          libraryTier: stats.libraryTier,
          updatedAt: stats.updatedAt,
        },
      });
  },
};
