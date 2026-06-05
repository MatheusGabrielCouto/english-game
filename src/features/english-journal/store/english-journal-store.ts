/**
 * Barrel do vault — preferir slices granulares (P-45):
 * - useVaultEntriesStore
 * - useVaultMetaStore
 * - useVaultCollectionsStore
 */
export { useVaultEntriesStore, type VaultEntriesState } from './vault-entries-store'
export { useVaultMetaStore, type VaultMetaState } from './vault-meta-store'
export { useVaultCollectionsStore, type VaultCollectionsState } from './vault-collections-store'

import { useVaultMetaStore } from './vault-meta-store'

/** @deprecated Use useVaultMetaStore, useVaultEntriesStore ou useVaultCollectionsStore */
export const useEnglishJournalStore = useVaultMetaStore

/** @deprecated Use useVaultMetaStore */
export const useKnowledgeVaultStore = useVaultMetaStore
