import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';

import { VAULT_SPACES } from '@/features/english-journal/catalogs/vault-spaces-catalog';
import { mapCollectionRow, mapFolderRow } from '@/features/english-journal/utils/journal-mappers';
import type { VaultCollectionRecord, VaultFolderRecord, VaultSpaceKey } from '@/types/knowledge-vault';

import { getDb } from '../database/client';
import {
    journalCollections,
    journalEntries,
    journalEntryCollections,
    journalEntryLinks,
    journalFolders,
} from '../database/schema';

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const VaultRepository = {
  async seedDefaultFolders(): Promise<void> {
    const db = getDb();
    const existing = await db.select({ id: journalFolders.id }).from(journalFolders).limit(1);
    if (existing.length > 0) return;

    const now = new Date().toISOString();
    const folderRows = VAULT_SPACES.flatMap((space) =>
      space.defaultFolders.map((folder, index) => ({
        id: createId('folder'),
        spaceKey: space.key,
        parentId: null,
        name: folder.name,
        slug: folder.slug,
        sortOrder: index,
        createdAt: now,
      })),
    );

    if (folderRows.length > 0) {
      await db.insert(journalFolders).values(folderRows);
    }
  },

  async listFolders(spaceKey?: VaultSpaceKey): Promise<VaultFolderRecord[]> {
    const db = getDb();
    const rows = spaceKey
      ? await db
          .select()
          .from(journalFolders)
          .where(eq(journalFolders.spaceKey, spaceKey))
          .orderBy(journalFolders.sortOrder)
      : await db.select().from(journalFolders).orderBy(journalFolders.spaceKey, journalFolders.sortOrder);
    return rows.map(mapFolderRow);
  },

  async findFolder(id: string): Promise<VaultFolderRecord | null> {
    const db = getDb();
    const rows = await db.select().from(journalFolders).where(eq(journalFolders.id, id)).limit(1);
    return rows[0] ? mapFolderRow(rows[0]) : null;
  },

  async createFolder(input: {
    spaceKey: VaultSpaceKey;
    name: string;
    parentId?: string | null;
  }): Promise<VaultFolderRecord> {
    const db = getDb();
    const slug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const id = createId('folder');
    const now = new Date().toISOString();
    await db.insert(journalFolders).values({
      id,
      spaceKey: input.spaceKey,
      parentId: input.parentId ?? null,
      name: input.name.trim(),
      slug: slug || 'folder',
      sortOrder: 99,
      createdAt: now,
    });
    return (await VaultRepository.findFolder(id))!;
  },

  async listCollections(): Promise<VaultCollectionRecord[]> {
    const db = getDb();
    const rows = await db.select().from(journalCollections).orderBy(desc(journalCollections.updatedAt));
    const counts = await db
      .select({
        collectionId: journalEntryCollections.collectionId,
        count: sql<number>`count(*)`,
      })
      .from(journalEntryCollections)
      .groupBy(journalEntryCollections.collectionId);

    const countMap = new Map(counts.map((c) => [c.collectionId, Number(c.count)]));
    return rows.map((row) => mapCollectionRow(row, countMap.get(row.id) ?? 0));
  },

  async findCollection(id: string): Promise<VaultCollectionRecord | null> {
    const db = getDb();
    const rows = await db.select().from(journalCollections).where(eq(journalCollections.id, id)).limit(1);
    if (!rows[0]) return null;
    const countRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(journalEntryCollections)
      .where(eq(journalEntryCollections.collectionId, id));
    return mapCollectionRow(rows[0], Number(countRows[0]?.count ?? 0));
  },

  async createCollection(input: {
    name: string;
    description?: string;
    emoji?: string;
  }): Promise<VaultCollectionRecord> {
    const db = getDb();
    const id = createId('collection');
    const now = new Date().toISOString();
    await db.insert(journalCollections).values({
      id,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      emoji: input.emoji ?? '📚',
      createdAt: now,
      updatedAt: now,
    });
    return (await VaultRepository.findCollection(id))!;
  },

  async updateCollection(
    id: string,
    input: { name: string; description?: string | null; emoji?: string },
  ): Promise<VaultCollectionRecord | null> {
    const db = getDb();
    const existing = await VaultRepository.findCollection(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    await db
      .update(journalCollections)
      .set({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        emoji: input.emoji ?? existing.emoji,
        updatedAt: now,
      })
      .where(eq(journalCollections.id, id));

    return VaultRepository.findCollection(id);
  },

  async deleteCollection(id: string): Promise<boolean> {
    const db = getDb();
    const existing = await VaultRepository.findCollection(id);
    if (!existing) return false;

    await db.delete(journalEntryCollections).where(eq(journalEntryCollections.collectionId, id));
    await db.delete(journalCollections).where(eq(journalCollections.id, id));
    return true;
  },

  async setEntryCollections(entryId: string, collectionIds: string[]): Promise<void> {
    const db = getDb();
    await db.delete(journalEntryCollections).where(eq(journalEntryCollections.entryId, entryId));
    const now = new Date().toISOString();
    for (const collectionId of collectionIds) {
      await db.insert(journalEntryCollections).values({
        entryId,
        collectionId,
        createdAt: now,
      });
    }
  },

  async getCollectionIdsForEntry(entryId: string): Promise<string[]> {
    const db = getDb();
    const rows = await db
      .select({ collectionId: journalEntryCollections.collectionId })
      .from(journalEntryCollections)
      .where(eq(journalEntryCollections.entryId, entryId));
    return rows.map((r) => r.collectionId);
  },

  async getEntryIdsForCollection(collectionId: string): Promise<string[]> {
    const db = getDb();
    const rows = await db
      .select({ entryId: journalEntryCollections.entryId })
      .from(journalEntryCollections)
      .where(eq(journalEntryCollections.collectionId, collectionId));
    return rows.map((r) => r.entryId);
  },

  async linkEntries(fromId: string, toId: string): Promise<boolean> {
    if (fromId === toId) return false;
    const db = getDb();
    const now = new Date().toISOString();
    try {
      await db.insert(journalEntryLinks).values({
        fromEntryId: fromId,
        toEntryId: toId,
        createdAt: now,
      });
      await db.insert(journalEntryLinks).values({
        fromEntryId: toId,
        toEntryId: fromId,
        createdAt: now,
      });
      return true;
    } catch {
      return false;
    }
  },

  async unlinkEntries(fromId: string, toId: string): Promise<void> {
    const db = getDb();
    await db
      .delete(journalEntryLinks)
      .where(
        or(
          and(
            eq(journalEntryLinks.fromEntryId, fromId),
            eq(journalEntryLinks.toEntryId, toId),
          ),
          and(
            eq(journalEntryLinks.fromEntryId, toId),
            eq(journalEntryLinks.toEntryId, fromId),
          ),
        ),
      );
  },

  async getRelatedIds(entryId: string): Promise<string[]> {
    const map = await VaultRepository.getRelatedIdsBatch([entryId]);
    return map.get(entryId) ?? [];
  },

  async getRelatedIdsBatch(entryIds: string[]): Promise<Map<string, string[]>> {
    const map = new Map<string, string[]>();
    if (entryIds.length === 0) return map;

    const db = getDb();
    const rows = await db
      .select({
        fromEntryId: journalEntryLinks.fromEntryId,
        otherId: journalEntryLinks.toEntryId,
      })
      .from(journalEntryLinks)
      .where(inArray(journalEntryLinks.fromEntryId, entryIds));

    for (const entryId of entryIds) {
      map.set(entryId, []);
    }

    for (const row of rows) {
      if (row.otherId === row.fromEntryId) continue;
      const list = map.get(row.fromEntryId) ?? [];
      list.push(row.otherId);
      map.set(row.fromEntryId, list);
    }

    return map;
  },

  async purgeEntryRelations(entryId: string): Promise<void> {
    const db = getDb();
    await db.delete(journalEntryCollections).where(eq(journalEntryCollections.entryId, entryId));
    await db
      .delete(journalEntryLinks)
      .where(
        or(
          eq(journalEntryLinks.fromEntryId, entryId),
          eq(journalEntryLinks.toEntryId, entryId),
        ),
      );
  },

  async countConnections(): Promise<number> {
    const db = getDb();
    const rows = await db.select({ count: sql<number>`count(*)` }).from(journalEntryLinks);
    return Math.floor(Number(rows[0]?.count ?? 0) / 2);
  },

  async listAllLinks(): Promise<{ fromId: string; toId: string }[]> {
    const db = getDb();
    const rows = await db
      .select({
        fromId: journalEntryLinks.fromEntryId,
        toId: journalEntryLinks.toEntryId,
      })
      .from(journalEntryLinks);
    const seen = new Set<string>();
    const result: { fromId: string; toId: string }[] = [];
    for (const row of rows) {
      const key = [row.fromId, row.toId].sort().join(':');
      if (seen.has(key) || row.fromId === row.toId) continue;
      seen.add(key);
      result.push({ fromId: row.fromId, toId: row.toId });
    }
    return result;
  },

  async countCollections(): Promise<number> {
    const db = getDb();
    const rows = await db.select({ count: sql<number>`count(*)` }).from(journalCollections);
    return Number(rows[0]?.count ?? 0);
  },

  async listEntryIdsByFolder(folderId: string): Promise<string[]> {
    const db = getDb();
    const rows = await db
      .select({ id: journalEntries.id })
      .from(journalEntries)
      .where(and(eq(journalEntries.folderId, folderId), eq(journalEntries.isArchived, false)));
    return rows.map((r) => r.id);
  },

  async enrichEntryIdsWithCollections(entryIds: string[]): Promise<Map<string, string[]>> {
    if (entryIds.length === 0) return new Map();
    const db = getDb();
    const rows = await db
      .select()
      .from(journalEntryCollections)
      .where(inArray(journalEntryCollections.entryId, entryIds));
    const map = new Map<string, string[]>();
    for (const row of rows) {
      const list = map.get(row.entryId) ?? [];
      list.push(row.collectionId);
      map.set(row.entryId, list);
    }
    return map;
  },
};
