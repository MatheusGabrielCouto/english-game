import type { JournalListFilter } from '@/types/journal'
import type { VaultSpaceKey } from '@/types/knowledge-vault'

/** Debounce da busca inline na biblioteca (P-39). */
export const VAULT_LIBRARY_SEARCH_DEBOUNCE_MS = 280

export const buildVaultLibraryFilter = (
  spaceFilter?: VaultSpaceKey,
  search?: string,
): JournalListFilter => ({
  spaceKey: spaceFilter ?? 'all',
  search: search?.trim() || undefined,
})

/** Filtro equivalente a listar toda a biblioteca ativa (sem busca nem recortes). */
export const isVaultUnfilteredListFilter = (filter: JournalListFilter): boolean => {
  if (filter.search?.trim()) return false
  if (filter.spaceKey && filter.spaceKey !== 'all') return false
  if (filter.folderId && filter.folderId !== 'all') return false
  if (filter.collectionId && filter.collectionId !== 'all') return false
  if (filter.category && filter.category !== 'all') return false
  if (filter.importance && filter.importance !== 'all') return false
  if (filter.entryType && filter.entryType !== 'all') return false
  if (filter.favoritesOnly) return false
  if (filter.pinnedOnly) return false
  return true
}
