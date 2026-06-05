import { create } from 'zustand'

import type { VaultCollectionRecord, VaultFolderRecord, VaultMapNode } from '@/types/knowledge-vault'

export type VaultCollectionsState = {
  folders: VaultFolderRecord[]
  collections: VaultCollectionRecord[]
  mapTree: VaultMapNode[]
}

export const useVaultCollectionsStore = create<VaultCollectionsState>(() => ({
  folders: [],
  collections: [],
  mapTree: [],
}))
