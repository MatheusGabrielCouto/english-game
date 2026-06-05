import { create } from 'zustand'

import type { JournalEntryRecord } from '@/types/journal'

export type VaultEntriesState = {
  entries: JournalEntryRecord[]
  dueReviews: JournalEntryRecord[]
  favorites: JournalEntryRecord[]
  pinned: JournalEntryRecord[]
  recent: JournalEntryRecord[]
}

export const useVaultEntriesStore = create<VaultEntriesState>(() => ({
  entries: [],
  dueReviews: [],
  favorites: [],
  pinned: [],
  recent: [],
}))
