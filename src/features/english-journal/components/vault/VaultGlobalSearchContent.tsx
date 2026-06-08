import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'

import { NetworkErrorState, VirtualizedList } from '@/components/ui'
import { ScreenSkeleton } from '@/components/ui/skeleton'
import { INPUT_PLACEHOLDER_COLOR, VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE } from '@/constants'
import { vaultEntryHref } from '@/constants/routes'
import type { VaultEntryRecord, VaultSpaceKey } from '@/types/knowledge-vault'

import { VAULT_SPACES } from '../../catalogs/vault-spaces-catalog'
import { VAULT_UI } from '../../constants/vault-ui'
import { KnowledgeVaultService } from '../../services/knowledge-vault-service'
import { JournalEntryCard } from '../JournalEntryCard'
import { VaultSectionHeader } from './VaultSectionHeader'

const SEARCH_DEBOUNCE_MS = 280

const resolveInitialQuery = (param?: string | string[]): string => {
  if (typeof param === 'string') return param
  if (Array.isArray(param) && param[0]) return param[0]
  return ''
}

export const VaultGlobalSearchContent = () => {
  const router = useRouter()
  const { q } = useLocalSearchParams<{ q?: string | string[] }>()
  const [query, setQuery] = useState(() => resolveInitialQuery(q))
  const [spaceKey, setSpaceKey] = useState<VaultSpaceKey | 'all'>('all')
  const [results, setResults] = useState<VaultEntryRecord[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState(false)

  useEffect(() => {
    setQuery(resolveInitialQuery(q))
  }, [q])

  const runSearch = useCallback(async (trimmed: string) => {
    setIsSearching(true)
    setSearchError(false)

    try {
      const rows = await KnowledgeVaultService.globalSearch({
        query: trimmed,
        spaceKey,
      })
      setResults(rows)
      setHasSearched(true)
    } catch {
      setResults([])
      setHasSearched(true)
      setSearchError(true)
    } finally {
      setIsSearching(false)
    }
  }, [spaceKey])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
      setSearchError(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      void runSearch(trimmed)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, spaceKey, runSearch])

  const handleRetrySearch = useCallback(() => {
    const trimmed = query.trim()
    if (!trimmed) return
    void runSearch(trimmed)
  }, [query, runSearch])

  const handleOpenEntry = useCallback(
    (entry: VaultEntryRecord) => {
      router.push(vaultEntryHref(entry.id))
    },
    [router],
  )

  const handleFavorite = useCallback(async (id: string) => {
    await KnowledgeVaultService.toggleFavorite(id)
    setResults((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry,
      ),
    )
  }, [])

  const renderResult = useCallback(
    (entry: VaultEntryRecord) => (
      <JournalEntryCard
        entry={entry}
        onPress={() => handleOpenEntry(entry)}
        onToggleFavorite={() => void handleFavorite(entry.id)}
      />
    ),
    [handleFavorite, handleOpenEntry],
  )

  const listHeader = useMemo(
    () => (
      <View className="gap-4 pb-3">
        <View>
          <Text className="text-sm font-semibold text-foreground">{VAULT_UI.searchLabel}</Text>
          <Text className="text-xs text-foreground-secondary">{VAULT_UI.globalSearchSubtitle}</Text>
          <TextInput
            className="mt-2 rounded-xl border border-border bg-surface px-4 py-3  text-foreground"
            value={query}
            onChangeText={setQuery}
            placeholder={VAULT_UI.searchPlaceholder}
            placeholderTextColor={INPUT_PLACEHOLDER_COLOR}
            autoFocus
            returnKeyType="search"
            accessibilityLabel={VAULT_UI.globalSearchTrigger}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          <Pressable
            onPress={() => setSpaceKey('all')}
            accessibilityRole="button"
            accessibilityState={{ selected: spaceKey === 'all' }}
            className={`rounded-full border px-3 py-1.5 ${
              spaceKey === 'all' ? 'border-primary bg-primary/15' : 'border-border bg-surface'
            }`}>
            <Text
              className={`text-xs font-bold ${
                spaceKey === 'all' ? 'text-primary' : 'text-foreground-secondary'
              }`}>
              {VAULT_UI.globalSearchFilterAll}
            </Text>
          </Pressable>
          {VAULT_SPACES.map((space) => {
            const selected = spaceKey === space.key
            return (
              <Pressable
                key={space.key}
                onPress={() => setSpaceKey(space.key)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={`rounded-full border px-3 py-1.5 ${
                  selected ? 'border-primary bg-primary/15' : 'border-border bg-surface'
                }`}>
                <Text
                  className={`text-xs font-bold ${
                    selected ? 'text-primary' : 'text-foreground-secondary'
                  }`}>
                  {space.emoji} {space.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>

        {isSearching ? <ScreenSkeleton variant="vault" listCount={4} className="gap-3" /> : null}

        {!isSearching && searchError ? (
          <NetworkErrorState variant="generic" onRetry={handleRetrySearch} isRetrying={isSearching} />
        ) : null}

        {!isSearching && !searchError && !query.trim() ? (
          <Text className="text-sm leading-5 text-foreground-secondary">
            {VAULT_UI.globalSearchEmptyQuery}
          </Text>
        ) : null}

        {!isSearching && !searchError && hasSearched && query.trim() && results.length === 0 ? (
          <Text className="text-sm leading-5 text-foreground-secondary">
            {VAULT_UI.globalSearchNoResults}
          </Text>
        ) : null}

        {!isSearching && !searchError && results.length > 0 ? (
          <VaultSectionHeader
            emoji="🔍"
            title={VAULT_UI.globalSearchTitle}
            hint={VAULT_UI.globalSearchResults(results.length)}
          />
        ) : null}
      </View>
    ),
    [
      hasSearched,
      isSearching,
      query,
      results.length,
      searchError,
      spaceKey,
      handleRetrySearch,
    ],
  )

  return (
    <VirtualizedList
      className="flex-1"
      forceVirtualized
      data={results}
      estimatedItemSize={VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.journalEntry}
      keyExtractor={(entry) => entry.id}
      ListHeaderComponent={listHeader}
      ListFooterComponent={<View className="h-6" />}
      ItemSeparatorComponent={() => <View className="h-3" />}
      renderItem={renderResult}
      extraData={`${query}:${spaceKey}:${results.length}`}
    />
  )
}
