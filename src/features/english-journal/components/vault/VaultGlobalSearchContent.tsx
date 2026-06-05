import { useLocalSearchParams, useRouter } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'

import { ScreenSkeleton } from '@/components/ui/skeleton'
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

  useEffect(() => {
    setQuery(resolveInitialQuery(q))
  }, [q])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      void (async () => {
        const rows = await KnowledgeVaultService.globalSearch({
          query: trimmed,
          spaceKey,
        })
        setResults(rows)
        setHasSearched(true)
        setIsSearching(false)
      })()
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query, spaceKey])

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

  return (
    <View className="gap-4 pb-6">
      <View>
        <Text className="text-sm font-semibold text-foreground">{VAULT_UI.searchLabel}</Text>
        <Text className="text-xs text-foreground-secondary">{VAULT_UI.globalSearchSubtitle}</Text>
        <TextInput
          className="mt-2 rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground"
          value={query}
          onChangeText={setQuery}
          placeholder={VAULT_UI.searchPlaceholder}
          placeholderTextColor="#71717a"
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

      {isSearching ? <ScreenSkeleton variant="hero-list" listCount={3} className="gap-3" /> : null}

      {!isSearching && !query.trim() ? (
        <Text className="text-sm leading-5 text-foreground-secondary">
          {VAULT_UI.globalSearchEmptyQuery}
        </Text>
      ) : null}

      {!isSearching && hasSearched && query.trim() && results.length === 0 ? (
        <Text className="text-sm leading-5 text-foreground-secondary">
          {VAULT_UI.globalSearchNoResults}
        </Text>
      ) : null}

      {!isSearching && results.length > 0 ? (
        <View className="gap-3">
          <VaultSectionHeader
            emoji="🔍"
            title={VAULT_UI.globalSearchTitle}
            hint={VAULT_UI.globalSearchResults(results.length)}
          />
          {results.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onPress={() => handleOpenEntry(entry)}
              onToggleFavorite={() => void handleFavorite(entry.id)}
            />
          ))}
        </View>
      ) : null}
    </View>
  )
}
