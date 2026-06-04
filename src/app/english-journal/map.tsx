import { useFocusEffect } from 'expo-router'
import { useCallback, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { ScreenContainer, ScreenHeader } from '@/components/layout'
import { theme } from '@/constants'
import { KnowledgeMapFilters } from '@/features/english-journal/components/knowledge-map/KnowledgeMapFilters'
import { KnowledgeMapNoteSheet } from '@/features/english-journal/components/knowledge-map/KnowledgeMapNoteSheet'
import { KnowledgeMapSummary } from '@/features/english-journal/components/knowledge-map/KnowledgeMapSummary'
import { KnowledgeMindMap } from '@/features/english-journal/components/knowledge-map/KnowledgeMindMap'
import { VaultEmptyState } from '@/features/english-journal/components/vault/VaultEmptyState'
import { VaultScreenBody } from '@/features/english-journal/components/vault/VaultScreenBody'
import { GRAPH_UI } from '@/features/english-journal/constants/vault-graph-ui'
import { KnowledgeVaultService } from '@/features/english-journal/services/knowledge-vault-service'
import { useEnglishJournalStore } from '@/features/english-journal/store/english-journal-store'
import {
  getDefaultExpandedSpaceIds,
  type MindMapSnapshot,
} from '@/features/english-journal/utils/vault-map-builder'
import type { KnowledgeGraphFilter, VaultSpaceKey } from '@/types/knowledge-vault'

const DEFAULT_FILTER: KnowledgeGraphFilter = {
  spaceKey: 'all',
  entryType: 'all',
  tag: null,
  collectionId: 'all',
}

export default function KnowledgeMapRoute() {
  const refreshVault = useEnglishJournalStore((s) => s.refresh)
  const entries = useEnglishJournalStore((s) => s.entries)

  const [snapshot, setSnapshot] = useState<MindMapSnapshot | null>(null)
  const [filter, setFilter] = useState<KnowledgeGraphFilter>(DEFAULT_FILTER)
  const [reviewsOnly, setReviewsOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [expandedSpaceIds, setExpandedSpaceIds] = useState<Set<string>>(new Set())

  const entryTitleById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const entry of entries) {
      map[entry.id] = entry.title
    }
    return map
  }, [entries])

  const load = useCallback(async () => {
    setLoading(true)
    await refreshVault()
    const next = await KnowledgeVaultService.buildMindMap(filter, reviewsOnly)
    setSnapshot(next)
    setExpandedSpaceIds((prev) => {
      if (prev.size > 0) return prev
      return new Set(getDefaultExpandedSpaceIds(next.tree))
    })
    setLoading(false)
  }, [filter, refreshVault, reviewsOnly])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const highlightEntryIds = useMemo(() => {
    if (!selectedEntryId || !snapshot) return new Set<string>()
    const meta = snapshot.entryMeta[selectedEntryId]
    if (!meta) return new Set<string>()
    return new Set(meta.relatedIds)
  }, [selectedEntryId, snapshot])

  const selectedTitle = selectedEntryId ? entryTitleById[selectedEntryId] : null
  const selectedMeta = selectedEntryId ? snapshot?.entryMeta[selectedEntryId] : null
  const relatedTitles = useMemo(() => {
    if (!selectedEntryId || !snapshot) return []
    const meta = snapshot.entryMeta[selectedEntryId]
    if (!meta) return []
    return meta.relatedIds
      .map((id) => ({ id, title: entryTitleById[id] }))
      .filter((item) => item.title)
  }, [selectedEntryId, snapshot, entryTitleById])

  const handleToggleSpace = (spaceId: string) => {
    setExpandedSpaceIds((prev) => {
      const next = new Set(prev)
      if (next.has(spaceId)) next.delete(spaceId)
      else next.add(spaceId)
      return next
    })
  }

  const handleExpandAll = () => {
    if (!snapshot) return
    setExpandedSpaceIds(new Set(getDefaultExpandedSpaceIds(snapshot.tree)))
  }

  const handleCollapseAll = () => {
    setExpandedSpaceIds(new Set())
  }

  const isEmpty = Boolean(!loading && snapshot && snapshot.tree.length === 0)

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={GRAPH_UI.title} subtitle={GRAPH_UI.subtitle} emoji="🧠" />
      <VaultScreenBody hubActive="map" helpText={GRAPH_UI.intro} showHelp={isEmpty} helpDefaultOpen={isEmpty}>
        {loading || !snapshot ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : isEmpty ? (
          <VaultEmptyState emoji="🧠" title={GRAPH_UI.emptyTitle} body={GRAPH_UI.emptyBody} />
        ) : (
          <View className="gap-4">
            <KnowledgeMapSummary
              totalNotes={snapshot.metrics.totalNotes}
              totalConnections={snapshot.metrics.totalConnections}
              reviewsDue={snapshot.metrics.reviewsDue}
            />

            <KnowledgeMapFilters
              filter={filter}
              reviewsOnly={reviewsOnly}
              onSpaceChange={(spaceKey) =>
                setFilter((prev) => ({ ...prev, spaceKey: spaceKey as VaultSpaceKey | 'all' }))
              }
              onReviewsOnlyChange={setReviewsOnly}
            />

            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-muted">{GRAPH_UI.tapNote}</Text>
              <View className="flex-row gap-2">
                <TextButton label={GRAPH_UI.expandAll} onPress={handleExpandAll} />
                <TextButton label={GRAPH_UI.collapseAll} onPress={handleCollapseAll} />
              </View>
            </View>

            <KnowledgeMindMap
              tree={snapshot.tree}
              entryMeta={snapshot.entryMeta}
              expandedSpaceIds={expandedSpaceIds}
              onToggleSpace={handleToggleSpace}
              selectedEntryId={selectedEntryId}
              onSelectEntry={setSelectedEntryId}
              highlightEntryIds={highlightEntryIds}
            />

            {selectedEntryId && selectedTitle && selectedMeta ? (
              <KnowledgeMapNoteSheet
                title={selectedTitle}
                entryId={selectedEntryId}
                meta={selectedMeta}
                relatedTitles={relatedTitles}
                onClose={() => setSelectedEntryId(null)}
              />
            ) : null}
          </View>
        )}
      </VaultScreenBody>
    </ScreenContainer>
  )
}

const TextButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <Pressable onPress={onPress} accessibilityRole="button">
    <Text className="text-[10px] font-bold text-primary">{label}</Text>
  </Pressable>
)
