import { create } from 'zustand';

import type { JournalEntryRecord, JournalListFilter, JournalStatsRecord } from '@/types/journal';
import type { VaultCollectionRecord, VaultFolderRecord, VaultMapNode } from '@/types/knowledge-vault';

type EnglishJournalState = {
  entries: JournalEntryRecord[];
  dueReviews: JournalEntryRecord[];
  favorites: JournalEntryRecord[];
  pinned: JournalEntryRecord[];
  recent: JournalEntryRecord[];
  stats: JournalStatsRecord | null;
  folders: VaultFolderRecord[];
  collections: VaultCollectionRecord[];
  mapTree: VaultMapNode[];
  filter: JournalListFilter;
  isLoading: boolean;
  setFilter: (filter: JournalListFilter) => void;
  refresh: (filter?: JournalListFilter) => Promise<void>;
};

export const useEnglishJournalStore = create<EnglishJournalState>((set, get) => ({
  entries: [],
  dueReviews: [],
  favorites: [],
  pinned: [],
  recent: [],
  stats: null,
  folders: [],
  collections: [],
  mapTree: [],
  filter: {},
  isLoading: true,

  setFilter: (filter) => set({ filter }),

  refresh: async (filter) => {
    const { KnowledgeVaultService } = await import('../services/knowledge-vault-service');
    await KnowledgeVaultService.refresh(filter ?? get().filter);
  },
}));

export const useKnowledgeVaultStore = useEnglishJournalStore;
