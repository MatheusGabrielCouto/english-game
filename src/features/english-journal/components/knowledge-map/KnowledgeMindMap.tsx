import { useMemo } from 'react'
import { Pressable, Text, View } from 'react-native'

import { theme } from '@/constants'
import type { VaultMapNode } from '@/types/knowledge-vault'
import { cn } from '@/utils'

import { GRAPH_UI } from '../../constants/vault-graph-ui'
import { getSpaceColor } from '../../constants/vault-space-colors'
import type { MindMapEntryMeta } from '../../utils/vault-map-builder'

type KnowledgeMindMapProps = {
  tree: VaultMapNode[]
  entryMeta: Record<string, MindMapEntryMeta>
  expandedSpaceIds: Set<string>
  onToggleSpace: (spaceId: string) => void
  selectedEntryId: string | null
  onSelectEntry: (entryId: string | null) => void
  highlightEntryIds: Set<string>
}

export const KnowledgeMindMap = ({
  tree,
  entryMeta,
  expandedSpaceIds,
  onToggleSpace,
  selectedEntryId,
  onSelectEntry,
  highlightEntryIds,
}: KnowledgeMindMapProps) => {
  if (tree.length === 0) {
    return null
  }

  return (
    <View className="gap-3">
      {tree.map((space) => (
        <SpaceBranch
          key={space.id}
          space={space}
          entryMeta={entryMeta}
          expanded={expandedSpaceIds.has(space.id)}
          onToggle={() => onToggleSpace(space.id)}
          selectedEntryId={selectedEntryId}
          onSelectEntry={onSelectEntry}
          highlightEntryIds={highlightEntryIds}
        />
      ))}
    </View>
  )
}

const SpaceBranch = ({
  space,
  entryMeta,
  expanded,
  onToggle,
  selectedEntryId,
  onSelectEntry,
  highlightEntryIds,
}: {
  space: VaultMapNode
  entryMeta: Record<string, MindMapEntryMeta>
  expanded: boolean
  onToggle: () => void
  selectedEntryId: string | null
  onSelectEntry: (entryId: string | null) => void
  highlightEntryIds: Set<string>
}) => {
  const spaceKey = space.spaceKey!
  const color = getSpaceColor(spaceKey)
  const noteCount = useMemo(
    () => space.children.reduce((sum, folder) => sum + folder.children.length, 0),
    [space.children],
  )

  return (
    <View
      className="overflow-hidden rounded-2xl border border-border/80 bg-surface"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <Pressable
        onPress={onToggle}
        className="flex-row items-center gap-3 px-4 py-3"
        accessibilityRole="button"
        accessibilityState={{ expanded }}
      >
        <Text className="text-2xl">{space.emoji ?? '📁'}</Text>
        <View className="min-w-0 flex-1">
          <Text className=" font-black text-foreground">{space.label}</Text>
          <Text className="text-xs text-muted">
            {noteCount} nota{noteCount === 1 ? '' : 's'}
          </Text>
        </View>
        <Text className="text-sm text-muted">{expanded ? '▼' : '▶'}</Text>
      </Pressable>

      {expanded ? (
        <View className="border-t border-border/60 px-3 pb-3 pt-2">
          {space.children.length === 0 ? (
            <Text className="px-1 py-2 text-xs text-muted">Nenhuma nota nesta área.</Text>
          ) : (
            space.children.map((folder) => (
              <FolderBranch
                key={folder.id}
                folder={folder}
                color={color}
                entryMeta={entryMeta}
                selectedEntryId={selectedEntryId}
                onSelectEntry={onSelectEntry}
                highlightEntryIds={highlightEntryIds}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  )
}

const FolderBranch = ({
  folder,
  color,
  entryMeta,
  selectedEntryId,
  onSelectEntry,
  highlightEntryIds,
}: {
  folder: VaultMapNode
  color: string
  entryMeta: Record<string, MindMapEntryMeta>
  selectedEntryId: string | null
  onSelectEntry: (entryId: string | null) => void
  highlightEntryIds: Set<string>
}) => {
  const folderLabel =
    folder.id.startsWith('unfiled-') ? GRAPH_UI.unfiledFolder : folder.label

  return (
    <View className="mb-3 ml-2 border-l-2 border-border/50 pl-3" style={{ borderLeftColor: `${color}55` }}>
      <View className="mb-2 flex-row items-center gap-2">
        <Text className="text-sm">📂</Text>
        <Text className="text-sm font-bold text-foreground-secondary">{folderLabel}</Text>
      </View>

      <View className="flex-row flex-wrap gap-2">
        {folder.children.map((entry) => {
          if (!entry.entryId) return null
          const meta = entryMeta[entry.entryId]
          const selected = selectedEntryId === entry.entryId
          const highlighted = highlightEntryIds.has(entry.entryId)

          return (
            <EntryPill
              key={entry.id}
              label={entry.label}
              meta={meta}
              selected={selected}
              highlighted={highlighted}
              accentColor={color}
              onPress={() =>
                onSelectEntry(selected ? null : entry.entryId!)
              }
            />
          )
        })}
      </View>
    </View>
  )
}

const EntryPill = ({
  label,
  meta,
  selected,
  highlighted,
  accentColor,
  onPress,
}: {
  label: string
  meta?: MindMapEntryMeta
  selected: boolean
  highlighted: boolean
  accentColor: string
  onPress: () => void
}) => {
  const ringColor =
    meta?.reviewStatus === 'overdue'
      ? theme.colors.danger
      : meta?.reviewStatus === 'due_soon'
        ? theme.colors.warning
        : meta?.reviewStatus === 'ok'
          ? theme.colors.success
          : undefined

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'max-w-full rounded-xl border px-3 py-2',
        selected ? 'border-primary bg-primary/15' : 'border-border bg-background',
        highlighted && !selected && 'border-primary/40 bg-primary/8',
      )}
      style={
        ringColor && !selected
          ? { borderColor: ringColor, borderWidth: 1.5 }
          : selected
            ? { borderLeftWidth: 3, borderLeftColor: accentColor }
            : undefined
      }
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        className={cn(
          'text-sm font-medium',
          selected ? 'text-primary' : 'text-foreground',
        )}
        numberOfLines={2}
      >
        {label}
      </Text>
      {meta && meta.connectionCount > 0 ? (
        <Text className="mt-0.5 text-[10px] text-muted">
          🔗 {meta.connectionCount}
        </Text>
      ) : null}
    </Pressable>
  )
}
