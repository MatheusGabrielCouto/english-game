import { CityResourceService } from '@/features/city/services/city-resource-service';
import { PlayerService } from '@/features/player/services/player-service';
import { GameEvents } from '@/services/game-events';
import { JournalRepository } from '@/storage/repositories/journal-repository';
import { VaultRepository } from '@/storage/repositories/vault-repository';
import { CityResourceType } from '@/types/city-resource';
import {
    JournalCategory,
    JournalEntryType,
    type JournalCategoryValue,
    type JournalEntryRecord,
    type JournalEntryTypeValue,
    type JournalImportanceValue,
    type JournalListFilter,
    type JournalStatsRecord,
} from '@/types/journal';
import type {
    KnowledgeGraphFilter,
    KnowledgeGraphSnapshot,
    VaultCollectionRecord,
    VaultDashboardSnapshot,
    VaultEntryRecord,
    VaultFolderRecord,
    VaultGlobalSearchFilter,
    VaultMapNode,
    VaultReviewBundle,
    VaultSpaceKey,
} from '@/types/knowledge-vault';

import { VAULT_SPACE_BY_KEY } from '../catalogs/vault-spaces-catalog';
import { JOURNAL_XP, resolveCreateXp } from '../constants/journal-rewards';
import { useEnglishJournalStore } from '../store/english-journal-store';
import { entryTypeRequiresAudio, validateJournalBody, validateJournalTitle } from '../utils/journal-form';
import {
    getReviewMessageForStage,
    normalizeTagsInput,
    scheduleFirstReviewAt,
    scheduleNextReviewAfterStage,
} from '../utils/journal-review';
import { buildKnowledgeGraph } from '../utils/vault-graph-builder';
import { buildFilteredMindMapTree, buildVaultMapTree, type MindMapSnapshot } from '../utils/vault-map-builder';
import { applyKnowledgePoints, VAULT_KP } from '../utils/vault-progress';
import { deleteJournalAudioFile, persistJournalRecording } from './journal-audio-storage';

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export type CreateVaultEntryInput = {
  entryType: JournalEntryTypeValue;
  title: string;
  body?: string;
  category: JournalCategoryValue;
  importance: JournalImportanceValue;
  spaceKey: VaultSpaceKey;
  folderId?: string | null;
  tagsInput?: string;
  tags?: string[];
  audioTempUri?: string | null;
  audioDurationMs?: number | null;
  relatedEntryIds?: string[];
  collectionIds?: string[];
  isPinned?: boolean;
};

export type UpdateVaultEntryInput = Partial<
  Omit<CreateVaultEntryInput, 'audioTempUri'> & {
    audioTempUri?: string | null;
    removeAudio?: boolean;
    isFavorite?: boolean;
    isPinned?: boolean;
  }
>;

const grantKnowledgeToCity = async (category: JournalCategoryValue): Promise<void> => {
  switch (category) {
    case JournalCategory.VOCABULARY:
    case JournalCategory.GRAMMAR:
    case JournalCategory.READING:
      await CityResourceService.grant(CityResourceType.LEXICON_BRICK, 1, 'journal');
      break;
    case JournalCategory.SPEAKING:
    case JournalCategory.INTERVIEW:
    case JournalCategory.CAREER:
      await CityResourceService.grant(CityResourceType.FLUENCY_CEMENT, 1, 'journal');
      break;
    default:
      await CityResourceService.grant(CityResourceType.CONSISTENCY_WOOD, 1, 'journal');
      break;
  }
};

const enrichEntry = async (entry: JournalEntryRecord): Promise<VaultEntryRecord> => {
  const [relatedIds, collectionIds] = await Promise.all([
    VaultRepository.getRelatedIds(entry.id),
    VaultRepository.getCollectionIdsForEntry(entry.id),
  ]);
  return { ...entry, spaceKey: entry.spaceKey as VaultSpaceKey, relatedIds, collectionIds };
};

const syncStatsAggregates = async (stats: JournalStatsRecord): Promise<JournalStatsRecord> => {
  const [connections, collections, entryMetrics] = await Promise.all([
    VaultRepository.countConnections(),
    VaultRepository.countCollections(),
    JournalRepository.getActiveEntryMetrics(),
  ]);
  const next = applyKnowledgePoints(
    {
      ...stats,
      totalEntries: entryMetrics.totalEntries,
      totalVoiceNotes: entryMetrics.totalVoiceNotes,
      totalTextNotes: entryMetrics.totalTextNotes,
      totalVoiceMs: entryMetrics.totalVoiceMs,
      totalConnections: connections,
      totalCollections: collections,
    },
    0,
  );
  await JournalRepository.saveStats(next);
  return next;
};

const bumpStatsOnCreate = async (
  entry: JournalEntryRecord,
  xp: number,
  entryType: JournalEntryTypeValue,
): Promise<JournalStatsRecord> => {
  const stats = await JournalRepository.getStats();
  const isVoice = Boolean(entry.audioUri);
  const kp =
    entryType === JournalEntryType.LESSON_SUMMARY ? VAULT_KP.lessonSummary : VAULT_KP.createNote;
  const next = applyKnowledgePoints(
    {
      ...stats,
      totalEntries: stats.totalEntries + 1,
      totalVoiceNotes: stats.totalVoiceNotes + (isVoice ? 1 : 0),
      totalTextNotes: stats.totalTextNotes + (isVoice ? 0 : 1),
      totalVoiceMs: stats.totalVoiceMs + (entry.audioDurationMs ?? 0),
      totalXpFromJournal: stats.totalXpFromJournal + xp,
      knowledgeProgress: stats.knowledgeProgress + 1,
    },
    kp,
  );
  return syncStatsAggregates(next);
};

const bumpStatsOnReview = async (): Promise<JournalStatsRecord> => {
  const stats = await JournalRepository.getStats();
  const next = applyKnowledgePoints(
    {
      ...stats,
      totalReviews: stats.totalReviews + 1,
      totalXpFromJournal: stats.totalXpFromJournal + JOURNAL_XP.reviewNote,
    },
    VAULT_KP.review,
  );
  return syncStatsAggregates(next);
};

const refreshStore = async (filter?: JournalListFilter): Promise<void> => {
  const activeFilter = filter ?? useEnglishJournalStore.getState().filter;
  const [
    entries,
    dueReviews,
    favorites,
    pinned,
    recent,
    stats,
    folders,
    collections,
    mapTree,
  ] = await Promise.all([
    JournalRepository.listActive(activeFilter),
    JournalRepository.listDueReviews(),
    JournalRepository.listFavorites(),
    JournalRepository.listPinned(),
    JournalRepository.listRecent(12),
    JournalRepository.getStats().then(syncStatsAggregates),
    VaultRepository.listFolders(),
    VaultRepository.listCollections(),
    JournalRepository.listActive().then(async (all) => {
      const folderList = await VaultRepository.listFolders();
      return buildVaultMapTree(all, folderList);
    }),
  ]);

  useEnglishJournalStore.setState({
    entries,
    dueReviews,
    favorites,
    pinned,
    recent,
    stats,
    folders,
    collections,
    mapTree,
    isLoading: false,
  });
};

export const KnowledgeVaultService = {
  async initialize(): Promise<void> {
    useEnglishJournalStore.setState({ isLoading: true });
    await VaultRepository.seedDefaultFolders();
    await refreshStore();
  },

  async refresh(filter?: JournalListFilter): Promise<void> {
    if (filter) {
      useEnglishJournalStore.setState({ filter, isLoading: true });
    }
    await refreshStore(filter ?? useEnglishJournalStore.getState().filter);
  },

  async globalSearch(filter: VaultGlobalSearchFilter): Promise<VaultEntryRecord[]> {
    const listFilter: JournalListFilter = {
      search: filter.query,
      spaceKey: filter.spaceKey === 'all' ? undefined : filter.spaceKey,
      folderId: filter.folderId === 'all' ? undefined : filter.folderId,
      collectionId: filter.collectionId === 'all' ? undefined : filter.collectionId,
      category: filter.category === 'all' ? undefined : filter.category,
      entryType: filter.entryType === 'all' ? undefined : filter.entryType,
      pinnedOnly: filter.pinnedOnly,
      favoritesOnly: filter.favoritesOnly,
    };
    const rows = await JournalRepository.listActive(listFilter);
    let result = rows;
    if (filter.tags?.length) {
      result = result.filter((e) => filter.tags!.some((t) => e.tags.includes(t)));
    }
    return Promise.all(result.map(enrichEntry));
  },

  getReviewMessage(entry: JournalEntryRecord): string {
    const stage = Math.min(Math.max(entry.reviewStage + 1, 1), 4);
    return getReviewMessageForStage(stage);
  },

  async getEntry(id: string): Promise<VaultEntryRecord | null> {
    const row = await JournalRepository.findById(id);
    return row ? enrichEntry(row) : null;
  },

  async getReviewBundle(id: string): Promise<VaultReviewBundle | null> {
    const entry = await KnowledgeVaultService.getEntry(id);
    if (!entry) return null;
    const relatedEntries = await Promise.all(
      (entry.relatedIds ?? []).map(async (rid) => KnowledgeVaultService.getEntry(rid)),
    );
    return {
      entry,
      relatedEntries: relatedEntries.filter((e): e is VaultEntryRecord => e != null),
      message: KnowledgeVaultService.getReviewMessage(entry),
    };
  },

  async getDashboard(): Promise<VaultDashboardSnapshot> {
    const stats = await JournalRepository.getStats().then(syncStatsAggregates);
    const dueReviews = await JournalRepository.listDueReviews();
    const pinned = await JournalRepository.listPinned();
    const entries = await JournalRepository.listActive();
    const tagCounts = new Map<string, number>();
    for (const e of entries) {
      for (const tag of e.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    const topTags = [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    return {
      stats,
      dueReviewCount: dueReviews.length,
      pinnedCount: pinned.length,
      spaceCount: new Set(entries.map((e) => e.spaceKey)).size,
      topTags,
    };
  },

  async buildMap(): Promise<VaultMapNode[]> {
    const [entries, folders] = await Promise.all([
      JournalRepository.listActive(),
      VaultRepository.listFolders(),
    ]);
    return buildVaultMapTree(entries, folders);
  },

  async buildKnowledgeGraph(filter: KnowledgeGraphFilter = {}): Promise<KnowledgeGraphSnapshot> {
    const normalized = {
      spaceKey: filter.spaceKey ?? 'all',
      entryType: filter.entryType ?? 'all',
      tag: filter.tag ?? null,
      collectionId: filter.collectionId ?? 'all',
    };
    const collectionEntryIds =
      normalized.collectionId !== 'all'
        ? await VaultRepository.getEntryIdsForCollection(normalized.collectionId)
        : null;

    const [entries, folders, links, dueReviews, connectionCount] = await Promise.all([
      JournalRepository.listActive(),
      VaultRepository.listFolders(),
      VaultRepository.listAllLinks(),
      JournalRepository.listDueReviews(),
      VaultRepository.countConnections(),
    ]);

    return buildKnowledgeGraph({
      entries,
      folders,
      links,
      filter: normalized,
      collectionEntryIds,
      dueReviewCount: dueReviews.length,
      totalConnectionCount: connectionCount,
    });
  },

  async buildMindMap(
    filter: KnowledgeGraphFilter = {},
    reviewsOnly = false,
  ): Promise<MindMapSnapshot> {
    const normalized = {
      spaceKey: filter.spaceKey ?? 'all',
      entryType: filter.entryType ?? 'all',
      tag: filter.tag ?? null,
      collectionId: filter.collectionId ?? 'all',
    };
    const collectionEntryIds =
      normalized.collectionId !== 'all'
        ? await VaultRepository.getEntryIdsForCollection(normalized.collectionId)
        : null;

    const [entries, folders, links] = await Promise.all([
      JournalRepository.listActive(),
      VaultRepository.listFolders(),
      VaultRepository.listAllLinks(),
    ]);

    return buildFilteredMindMapTree({
      entries,
      folders,
      links,
      filter: normalized,
      collectionEntryIds,
      reviewsOnly,
    });
  },

  async create(input: CreateVaultEntryInput): Promise<VaultEntryRecord> {
    const titleCheck = validateJournalTitle(input.title);
    if (!titleCheck.valid) throw new Error(titleCheck.error);

    const bodyCheck = validateJournalBody(input.body ?? '', input.entryType);
    if (!bodyCheck.valid) throw new Error(bodyCheck.error);

    if (entryTypeRequiresAudio(input.entryType) && !input.audioTempUri) {
      throw new Error('Grave um áudio antes de salvar a nota de voz');
    }

    const id = createId('journal');
    const now = new Date().toISOString();
    let audioUri: string | null = null;

    if (input.audioTempUri) {
      audioUri = await persistJournalRecording(input.audioTempUri, id);
    }

    const tags = (input.tags ?? normalizeTagsInput(input.tagsInput ?? '')).map((t) =>
      t.startsWith('#') ? t.slice(1) : t,
    );

    const space = VAULT_SPACE_BY_KEY[input.spaceKey];

    await JournalRepository.insert({
      id,
      entryType: input.entryType,
      title: input.title.trim(),
      body: input.body?.trim() || null,
      category: input.category ?? space.defaultCategory,
      importance: input.importance,
      tags,
      audioUri,
      audioDurationMs: input.audioDurationMs ?? null,
      spaceKey: input.spaceKey,
      folderId: input.folderId ?? null,
      nextReviewAt: scheduleFirstReviewAt(),
      createdAt: now,
      updatedAt: now,
    });

    if (input.isPinned) {
      await JournalRepository.update(id, { isPinned: true, updatedAt: now });
    }

    if (input.collectionIds?.length) {
      await VaultRepository.setEntryCollections(id, input.collectionIds);
      const stats = await JournalRepository.getStats();
      await JournalRepository.saveStats(
        applyKnowledgePoints(stats, VAULT_KP.collectionAdd * input.collectionIds.length),
      );
      GameEvents.emit({
        type: 'JOURNAL_COLLECTION_UPDATED',
        entryId: id,
        collectionCount: input.collectionIds.length,
      });
    }

    let linksAdded = 0;
    for (const relatedId of input.relatedEntryIds ?? []) {
      const linked = await VaultRepository.linkEntries(id, relatedId);
      if (linked) linksAdded += 1;
    }
    if (linksAdded > 0) {
      const stats = await JournalRepository.getStats();
      await JournalRepository.saveStats(applyKnowledgePoints(stats, VAULT_KP.link * linksAdded));
      GameEvents.emit({ type: 'JOURNAL_LINK_CREATED', fromId: id, count: linksAdded });
    }

    const entry = await enrichEntry((await JournalRepository.findById(id))!);
    const xp = resolveCreateXp(input.entryType);

    PlayerService.addXP(xp);
    await grantKnowledgeToCity(entry.category);
    await bumpStatsOnCreate(entry, xp, input.entryType);

    GameEvents.emit({
      type: 'JOURNAL_ENTRY_CREATED',
      entryId: entry.id,
      entryType: entry.entryType,
      category: entry.category,
      isVoice: Boolean(entry.audioUri),
      xp,
    });

    await refreshStore();
    return entry;
  },

  async update(id: string, input: UpdateVaultEntryInput): Promise<VaultEntryRecord> {
    const existing = await JournalRepository.findById(id);
    if (!existing) throw new Error('Nota não encontrada');

    const title = input.title ?? existing.title;
    const entryType = input.entryType ?? existing.entryType;
    const titleCheck = validateJournalTitle(title);
    if (!titleCheck.valid) throw new Error(titleCheck.error);

    const body = input.body ?? existing.body ?? '';
    const bodyCheck = validateJournalBody(body, entryType);
    if (!bodyCheck.valid) throw new Error(bodyCheck.error);

    let audioUri = existing.audioUri;
    let audioDurationMs = input.audioDurationMs ?? existing.audioDurationMs;

    if (input.removeAudio) {
      await deleteJournalAudioFile(existing.audioUri);
      audioUri = null;
      audioDurationMs = null;
    } else if (input.audioTempUri) {
      await deleteJournalAudioFile(existing.audioUri);
      audioUri = await persistJournalRecording(input.audioTempUri, id);
    }

    if (entryTypeRequiresAudio(entryType) && !audioUri) {
      throw new Error('Grave um áudio antes de salvar a nota de voz');
    }

    const tags =
      input.tags ??
      (input.tagsInput != null ? normalizeTagsInput(input.tagsInput) : existing.tags);

    const now = new Date().toISOString();
    await JournalRepository.update(id, {
      entryType,
      title: title.trim(),
      body: body.trim() || null,
      category: input.category ?? existing.category,
      importance: input.importance ?? existing.importance,
      tags,
      audioUri,
      audioDurationMs,
      isFavorite: input.isFavorite ?? existing.isFavorite,
      isPinned: input.isPinned ?? existing.isPinned,
      spaceKey: input.spaceKey ?? existing.spaceKey,
      folderId: input.folderId !== undefined ? input.folderId : existing.folderId,
      updatedAt: now,
    });

    if (input.collectionIds) {
      await VaultRepository.setEntryCollections(id, input.collectionIds);
    }

    if (input.relatedEntryIds) {
      const current = await VaultRepository.getRelatedIds(id);
      const nextSet = new Set(input.relatedEntryIds);
      let linksAdded = 0;
      for (const rid of current) {
        if (!nextSet.has(rid)) {
          await VaultRepository.unlinkEntries(id, rid);
        }
      }
      for (const rid of input.relatedEntryIds) {
        if (!current.includes(rid)) {
          const linked = await VaultRepository.linkEntries(id, rid);
          if (linked) linksAdded += 1;
        }
      }
      if (linksAdded > 0) {
        const stats = await JournalRepository.getStats();
        await JournalRepository.saveStats(applyKnowledgePoints(stats, VAULT_KP.link * linksAdded));
        GameEvents.emit({ type: 'JOURNAL_LINK_CREATED', fromId: id, count: linksAdded });
      }
    }

    const entry = await enrichEntry((await JournalRepository.findById(id))!);
    await refreshStore();
    return entry;
  },

  async toggleFavorite(id: string): Promise<void> {
    const entry = await JournalRepository.findById(id);
    if (!entry) return;
    await JournalRepository.update(id, {
      isFavorite: !entry.isFavorite,
      updatedAt: new Date().toISOString(),
    });
    await refreshStore();
  },

  async togglePin(id: string): Promise<void> {
    const entry = await JournalRepository.findById(id);
    if (!entry) return;
    await JournalRepository.update(id, {
      isPinned: !entry.isPinned,
      updatedAt: new Date().toISOString(),
    });
    await refreshStore();
  },

  async linkEntries(fromId: string, toId: string): Promise<void> {
    const linked = await VaultRepository.linkEntries(fromId, toId);
    if (!linked) return;
    const stats = await JournalRepository.getStats();
    await JournalRepository.saveStats(applyKnowledgePoints(stats, VAULT_KP.link));
    GameEvents.emit({ type: 'JOURNAL_LINK_CREATED', fromId, count: 1 });
    await refreshStore();
  },

  async createCollection(input: {
    name: string;
    description?: string;
    emoji?: string;
  }): Promise<VaultCollectionRecord> {
    const collection = await VaultRepository.createCollection(input);
    await refreshStore();
    return collection;
  },

  async updateCollection(
    id: string,
    input: { name: string; description?: string | null; emoji?: string },
  ): Promise<VaultCollectionRecord> {
    const updated = await VaultRepository.updateCollection(id, input);
    if (!updated) throw new Error('Lista não encontrada');
    await refreshStore();
    return updated;
  },

  async deleteCollection(id: string): Promise<void> {
    const deleted = await VaultRepository.deleteCollection(id);
    if (!deleted) throw new Error('Lista não encontrada');
    await refreshStore();
  },

  async archive(id: string): Promise<void> {
    await JournalRepository.update(id, {
      isArchived: true,
      updatedAt: new Date().toISOString(),
    });
    const stats = await JournalRepository.getStats();
    await syncStatsAggregates(stats);
    await refreshStore();
  },

  async delete(id: string): Promise<void> {
    const entry = await JournalRepository.findById(id);
    if (!entry) return;
    await deleteJournalAudioFile(entry.audioUri);
    await VaultRepository.purgeEntryRelations(id);
    await JournalRepository.delete(id);
    const stats = await JournalRepository.getStats();
    await syncStatsAggregates(stats);
    await refreshStore();
  },

  async completeReview(id: string): Promise<VaultEntryRecord> {
    const entry = await JournalRepository.findById(id);
    if (!entry) throw new Error('Nota não encontrada');

    const nextStage = entry.reviewStage + 1;
    const nextReviewAt = scheduleNextReviewAfterStage(nextStage);
    const now = new Date().toISOString();

    await JournalRepository.update(id, {
      reviewStage: nextStage,
      reviewCount: entry.reviewCount + 1,
      nextReviewAt,
      lastReviewedAt: now,
      updatedAt: now,
    });

    PlayerService.addXP(JOURNAL_XP.reviewNote);
    await bumpStatsOnReview();

    const updated = await enrichEntry((await JournalRepository.findById(id))!);

    GameEvents.emit({
      type: 'JOURNAL_ENTRY_REVIEWED',
      entryId: updated.id,
      reviewStage: updated.reviewStage,
      xp: JOURNAL_XP.reviewNote,
    });

    await refreshStore();
    return updated;
  },

  async replayVoice(id: string): Promise<void> {
    const entry = await JournalRepository.findById(id);
    if (!entry?.audioUri) return;
    PlayerService.addXP(JOURNAL_XP.replayVoice);
    GameEvents.emit({
      type: 'JOURNAL_VOICE_REPLAYED',
      entryId: entry.id,
      xp: JOURNAL_XP.replayVoice,
    });
  },

  async listFolders(spaceKey?: VaultSpaceKey): Promise<VaultFolderRecord[]> {
    return VaultRepository.listFolders(spaceKey);
  },
};
