import { create } from 'zustand'

import type { JournalListFilter, JournalStatsRecord } from '@/types/journal'

export type VaultMetaState = {
  stats: JournalStatsRecord | null
  filter: JournalListFilter
  isLoading: boolean
  setFilter: (filter: JournalListFilter) => void
  refresh: (filter?: JournalListFilter) => Promise<void>
}

export const useVaultMetaStore = create<VaultMetaState>((set, get) => ({
  stats: null,
  filter: {},
  isLoading: true,

  setFilter: (filter) => set({ filter }),

  refresh: async (filter) => {
    const { KnowledgeVaultService } = await import('../services/knowledge-vault-service')
    await KnowledgeVaultService.refresh(filter ?? get().filter)
  },
}))
