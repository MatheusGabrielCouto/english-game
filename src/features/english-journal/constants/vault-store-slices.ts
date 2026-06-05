/**
 * Slices do vault store (P-45).
 * Código puro — sem imports nativos — para testes Node.
 */
export const VAULT_ENTRIES_SLICE_KEYS = [
  'entries',
  'dueReviews',
  'favorites',
  'pinned',
  'recent',
] as const

export const VAULT_META_SLICE_KEYS = ['stats', 'filter', 'isLoading'] as const

export const VAULT_COLLECTIONS_SLICE_KEYS = ['folders', 'collections', 'mapTree'] as const

export type VaultEntriesSliceKey = (typeof VAULT_ENTRIES_SLICE_KEYS)[number]
export type VaultMetaSliceKey = (typeof VAULT_META_SLICE_KEYS)[number]
export type VaultCollectionsSliceKey = (typeof VAULT_COLLECTIONS_SLICE_KEYS)[number]

export const isVaultEntriesSliceKey = (key: string): key is VaultEntriesSliceKey =>
  (VAULT_ENTRIES_SLICE_KEYS as readonly string[]).includes(key)

export const isVaultMetaSliceKey = (key: string): key is VaultMetaSliceKey =>
  (VAULT_META_SLICE_KEYS as readonly string[]).includes(key)

export const isVaultCollectionsSliceKey = (key: string): key is VaultCollectionsSliceKey =>
  (VAULT_COLLECTIONS_SLICE_KEYS as readonly string[]).includes(key)
