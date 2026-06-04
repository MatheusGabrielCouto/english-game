import type { JournalEntryRecord } from '@/types/journal'
import type {
  KnowledgeGraphFilter,
  KnowledgeGraphReviewStatus,
  VaultFolderRecord,
  VaultMapNode,
  VaultSpaceKey,
} from '@/types/knowledge-vault'

import { VAULT_SPACES, VAULT_SPACE_BY_KEY } from '../catalogs/vault-spaces-catalog'
import { isReviewDue } from './journal-review'

type LinkRow = { fromId: string; toId: string }

export type MindMapEntryMeta = {
  reviewStatus: KnowledgeGraphReviewStatus
  connectionCount: number
  relatedIds: string[]
}

export type MindMapSnapshot = {
  tree: VaultMapNode[]
  entryMeta: Record<string, MindMapEntryMeta>
  metrics: {
    totalNotes: number
    totalConnections: number
    reviewsDue: number
  }
}

const getReviewStatus = (entry: JournalEntryRecord): KnowledgeGraphReviewStatus => {
  if (!entry.nextReviewAt) return 'none'
  if (isReviewDue(entry.nextReviewAt)) return 'overdue'
  const diff = new Date(entry.nextReviewAt).getTime() - Date.now()
  const twoDays = 2 * 24 * 60 * 60 * 1000
  if (diff <= twoDays) return 'due_soon'
  return 'ok'
}

const matchesFilter = (
  entry: JournalEntryRecord,
  filter: KnowledgeGraphFilter,
  collectionEntryIds: Set<string> | null,
): boolean => {
  if (filter.spaceKey && filter.spaceKey !== 'all' && entry.spaceKey !== filter.spaceKey) {
    return false
  }
  if (filter.entryType && filter.entryType !== 'all' && entry.entryType !== filter.entryType) {
    return false
  }
  if (filter.tag && !entry.tags.includes(filter.tag)) {
    return false
  }
  if (collectionEntryIds && !collectionEntryIds.has(entry.id)) {
    return false
  }
  return true
}

export const buildVaultMapTree = (
  entries: JournalEntryRecord[],
  folders: VaultFolderRecord[],
): VaultMapNode[] => {
  return buildFilteredMindMapTree({
    entries,
    folders,
    links: [],
    filter: { spaceKey: 'all', entryType: 'all', tag: null, collectionId: 'all' },
    collectionEntryIds: null,
    reviewsOnly: false,
  }).tree
}

export const buildFilteredMindMapTree = (input: {
  entries: JournalEntryRecord[]
  folders: VaultFolderRecord[]
  links: LinkRow[]
  filter: KnowledgeGraphFilter
  collectionEntryIds: string[] | null
  reviewsOnly: boolean
}): MindMapSnapshot => {
  const { entries, folders, links, filter, reviewsOnly } = input
  const collectionSet = input.collectionEntryIds ? new Set(input.collectionEntryIds) : null

  let visibleEntries = entries.filter((e) => matchesFilter(e, filter, collectionSet))
  if (reviewsOnly) {
    visibleEntries = visibleEntries.filter((e) => {
      const status = getReviewStatus(e)
      return status === 'overdue' || status === 'due_soon'
    })
  }

  const visibleIds = new Set(visibleEntries.map((e) => e.id))
  const relatedByEntry = new Map<string, Set<string>>()
  const connectionCount = new Map<string, number>()

  for (const entry of visibleEntries) {
    relatedByEntry.set(entry.id, new Set())
    connectionCount.set(entry.id, 0)
  }

  let totalConnections = 0
  const seenPairs = new Set<string>()
  for (const link of links) {
    if (!visibleIds.has(link.fromId) || !visibleIds.has(link.toId)) continue
    const key = [link.fromId, link.toId].sort().join(':')
    if (seenPairs.has(key)) continue
    seenPairs.add(key)
    totalConnections += 1
    connectionCount.set(link.fromId, (connectionCount.get(link.fromId) ?? 0) + 1)
    connectionCount.set(link.toId, (connectionCount.get(link.toId) ?? 0) + 1)
    relatedByEntry.get(link.fromId)?.add(link.toId)
    relatedByEntry.get(link.toId)?.add(link.fromId)
  }

  const entryMeta: Record<string, MindMapEntryMeta> = {}
  for (const entry of visibleEntries) {
    entryMeta[entry.id] = {
      reviewStatus: getReviewStatus(entry),
      connectionCount: connectionCount.get(entry.id) ?? 0,
      relatedIds: [...(relatedByEntry.get(entry.id) ?? [])],
    }
  }

  const bySpace = new Map<VaultSpaceKey, JournalEntryRecord[]>()
  for (const entry of visibleEntries) {
    const key = entry.spaceKey as VaultSpaceKey
    const list = bySpace.get(key) ?? []
    list.push(entry)
    bySpace.set(key, list)
  }

  const activeSpaces =
    filter.spaceKey && filter.spaceKey !== 'all'
      ? VAULT_SPACES.filter((s) => s.key === filter.spaceKey)
      : VAULT_SPACES.filter((s) => (bySpace.get(s.key)?.length ?? 0) > 0)

  const tree: VaultMapNode[] = activeSpaces.map((space) => {
    const spaceEntries = bySpace.get(space.key) ?? []
    const spaceFolders = folders.filter((f) => f.spaceKey === space.key)

    const folderNodes: VaultMapNode[] = []
    for (const folder of spaceFolders) {
      const folderEntries = spaceEntries.filter((e) => e.folderId === folder.id)
      if (folderEntries.length === 0) continue
      folderNodes.push({
        id: `folder-${folder.id}`,
        type: 'folder',
        label: folder.name,
        folderId: folder.id,
        spaceKey: space.key,
        depth: 1,
        children: folderEntries.map((entry) => ({
          id: `entry-${entry.id}`,
          type: 'entry' as const,
          label: entry.title,
          entryId: entry.id,
          spaceKey: space.key,
          folderId: folder.id,
          depth: 2,
          children: [],
        })),
      })
    }

    const unfiled = spaceEntries.filter((e) => !e.folderId)
    if (unfiled.length > 0) {
      folderNodes.push({
        id: `unfiled-${space.key}`,
        type: 'folder',
        label: 'Sem pasta',
        spaceKey: space.key,
        folderId: null,
        depth: 1,
        children: unfiled.map((entry) => ({
          id: `entry-${entry.id}`,
          type: 'entry' as const,
          label: entry.title,
          entryId: entry.id,
          spaceKey: space.key,
          depth: 2,
          children: [],
        })),
      })
    }

    return {
      id: `space-${space.key}`,
      type: 'space' as const,
      label: space.label,
      emoji: space.emoji,
      spaceKey: space.key,
      depth: 0,
      children: folderNodes,
    }
  })

  const reviewsDue = visibleEntries.filter((e) => {
    const s = entryMeta[e.id]?.reviewStatus
    return s === 'overdue' || s === 'due_soon'
  }).length

  return {
    tree,
    entryMeta,
    metrics: {
      totalNotes: visibleEntries.length,
      totalConnections,
      reviewsDue,
    },
  }
}

export const getSpaceLabel = (key: string): string =>
  VAULT_SPACE_BY_KEY[key as VaultSpaceKey]?.label ?? key

export const countEntriesInTree = (tree: VaultMapNode[]): number => {
  let count = 0
  for (const space of tree) {
    for (const folder of space.children) {
      count += folder.children.length
    }
  }
  return count
}

export const getDefaultExpandedSpaceIds = (tree: VaultMapNode[]): string[] =>
  tree.map((space) => space.id)
