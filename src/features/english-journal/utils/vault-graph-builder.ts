import type { JournalEntryRecord, JournalEntryTypeValue } from '@/types/journal';
import type {
  KnowledgeGraphEdge,
  KnowledgeGraphFilter,
  KnowledgeGraphMetrics,
  KnowledgeGraphNode,
  KnowledgeGraphReviewStatus,
  KnowledgeGraphSnapshot,
  VaultFolderRecord,
  VaultSpaceKey,
} from '@/types/knowledge-vault';

import { VAULT_SPACES, VAULT_SPACE_BY_KEY } from '../catalogs/vault-spaces-catalog';
import { getSpaceColor } from '../constants/vault-space-colors';
import { isReviewDue } from './journal-review';

const CLUSTER_W = 300;
const CLUSTER_H = 280;
const MAX_ENTRIES_PER_FOLDER = 10;

type LinkRow = { fromId: string; toId: string };

const getReviewStatus = (entry: JournalEntryRecord): KnowledgeGraphReviewStatus => {
  if (!entry.nextReviewAt) return 'none';
  if (isReviewDue(entry.nextReviewAt)) return 'overdue';
  const diff = new Date(entry.nextReviewAt).getTime() - Date.now();
  const twoDays = 2 * 24 * 60 * 60 * 1000;
  if (diff <= twoDays) return 'due_soon';
  return 'ok';
};

const computeHeat = (entry: JournalEntryRecord, maxReviews: number): number => {
  const reviewScore = maxReviews > 0 ? entry.reviewCount / maxReviews : 0;
  const importanceBoost =
    entry.importance === 'critical' ? 1 : entry.importance === 'high' ? 0.75 : entry.importance === 'medium' ? 0.5 : 0.3;
  return Math.min(1, 0.4 + reviewScore * 0.35 + importanceBoost * 0.25);
};

const matchesFilter = (
  entry: JournalEntryRecord,
  filter: KnowledgeGraphFilter,
  collectionEntryIds: Set<string> | null,
): boolean => {
  if (filter.spaceKey && filter.spaceKey !== 'all' && entry.spaceKey !== filter.spaceKey) {
    return false;
  }
  if (filter.entryType && filter.entryType !== 'all' && entry.entryType !== filter.entryType) {
    return false;
  }
  if (filter.tag && !entry.tags.includes(filter.tag)) {
    return false;
  }
  if (collectionEntryIds && !collectionEntryIds.has(entry.id)) {
    return false;
  }
  return true;
};

export const buildKnowledgeGraph = (input: {
  entries: JournalEntryRecord[];
  folders: VaultFolderRecord[];
  links: LinkRow[];
  filter: KnowledgeGraphFilter;
  collectionEntryIds: string[] | null;
  dueReviewCount: number;
  totalConnectionCount: number;
}): KnowledgeGraphSnapshot => {
  const { entries, folders, links, filter, dueReviewCount, totalConnectionCount } = input;
  const collectionSet = input.collectionEntryIds ? new Set(input.collectionEntryIds) : null;

  const visibleEntries = entries.filter((e) => matchesFilter(e, filter, collectionSet));
  const visibleIds = new Set(visibleEntries.map((e) => e.id));

  const connectionCountByEntry = new Map<string, number>();
  for (const entry of visibleEntries) {
    connectionCountByEntry.set(entry.id, 0);
  }
  const relationEdges: KnowledgeGraphEdge[] = [];
  const seenPairs = new Set<string>();
  for (const link of links) {
    if (!visibleIds.has(link.fromId) || !visibleIds.has(link.toId)) continue;
    const key = [link.fromId, link.toId].sort().join(':');
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    connectionCountByEntry.set(link.fromId, (connectionCountByEntry.get(link.fromId) ?? 0) + 1);
    connectionCountByEntry.set(link.toId, (connectionCountByEntry.get(link.toId) ?? 0) + 1);
    relationEdges.push({
      id: `rel-${link.fromId}-${link.toId}`,
      from: `entry-${link.fromId}`,
      to: `entry-${link.toId}`,
      kind: 'relation',
    });
  }

  const maxReviews = Math.max(1, ...visibleEntries.map((e) => e.reviewCount));
  const bySpace = new Map<VaultSpaceKey, JournalEntryRecord[]>();
  for (const entry of visibleEntries) {
    const key = entry.spaceKey as VaultSpaceKey;
    const list = bySpace.get(key) ?? [];
    list.push(entry);
    bySpace.set(key, list);
  }

  const activeSpaces =
    filter.spaceKey && filter.spaceKey !== 'all'
      ? VAULT_SPACES.filter((s) => s.key === filter.spaceKey)
      : VAULT_SPACES.filter((s) => (bySpace.get(s.key)?.length ?? 0) > 0);

  const nodes: KnowledgeGraphNode[] = [];
  const hierarchyEdges: KnowledgeGraphEdge[] = [];

  const cols = Math.max(1, Math.ceil(Math.sqrt(activeSpaces.length)));
  const canvasWidth = Math.max(360, cols * CLUSTER_W + 80);
  const canvasHeight = Math.max(
    400,
    Math.ceil(activeSpaces.length / cols) * CLUSTER_H + 80,
  );

  activeSpaces.forEach((space, spaceIndex) => {
    const col = spaceIndex % cols;
    const row = Math.floor(spaceIndex / cols);
    const cx = 100 + col * CLUSTER_W + CLUSTER_W / 2;
    const cy = 100 + row * CLUSTER_H + CLUSTER_H / 2;
    const color = getSpaceColor(space.key);
    const spaceEntries = bySpace.get(space.key) ?? [];
    const spaceNodeId = `space-${space.key}`;

    nodes.push({
      id: spaceNodeId,
      type: 'space',
      label: space.label,
      x: cx,
      y: cy - 70,
      radius: 38,
      color,
      opacity: 1,
      spaceKey: space.key,
      reviewStatus: 'none',
      connectionCount: spaceEntries.length,
      heat: Math.min(1, spaceEntries.length / 12),
      tags: [],
    });

    const spaceFolders = folders.filter((f) => f.spaceKey === space.key);
    const folderCount = Math.max(spaceFolders.length, 1);
    const folderPositions: { folder: VaultFolderRecord; x: number; y: number }[] = [];

    spaceFolders.forEach((folder, fi) => {
      const angle = (fi / folderCount) * Math.PI * 2 - Math.PI / 2;
      const fx = cx + Math.cos(angle) * 95;
      const fy = cy + Math.sin(angle) * 55;
      folderPositions.push({ folder, x: fx, y: fy });
    });

    folderPositions.forEach(({ folder, x, y }) => {
      const folderNodeId = `folder-${folder.id}`;
      const folderEntries = spaceEntries
        .filter((e) => e.folderId === folder.id)
        .slice(0, MAX_ENTRIES_PER_FOLDER);

      nodes.push({
        id: folderNodeId,
        type: 'folder',
        label: folder.name,
        x,
        y,
        radius: 26,
        color,
        opacity: folderEntries.length > 0 ? 0.95 : 0.45,
        spaceKey: space.key,
        folderId: folder.id,
        reviewStatus: 'none',
        connectionCount: folderEntries.length,
        heat: Math.min(1, folderEntries.length / 6),
        tags: [],
      });

      hierarchyEdges.push({
        id: `h-${spaceNodeId}-${folderNodeId}`,
        from: spaceNodeId,
        to: folderNodeId,
        kind: 'hierarchy',
      });

      folderEntries.forEach((entry, ei) => {
        const spread = Math.min(folderEntries.length, 6);
        const eAngle = (ei / spread) * Math.PI - Math.PI / 2;
        const ex = x + Math.cos(eAngle) * 58;
        const ey = y + Math.sin(eAngle) * 48 + 20;
        const entryNodeId = `entry-${entry.id}`;

        nodes.push({
          id: entryNodeId,
          type: 'entry',
          label: entry.title,
          x: ex,
          y: ey,
          radius: 14 + Math.round(computeHeat(entry, maxReviews) * 8),
          color,
          opacity: 0.55 + computeHeat(entry, maxReviews) * 0.45,
          spaceKey: space.key,
          folderId: folder.id,
          entryId: entry.id,
          reviewStatus: getReviewStatus(entry),
          connectionCount: connectionCountByEntry.get(entry.id) ?? 0,
          heat: computeHeat(entry, maxReviews),
          entryType: entry.entryType,
          category: entry.category,
          tags: entry.tags,
          createdAt: entry.createdAt,
        });

        hierarchyEdges.push({
          id: `h-${folderNodeId}-${entryNodeId}`,
          from: folderNodeId,
          to: entryNodeId,
          kind: 'hierarchy',
        });
      });
    });

    const unfiled = spaceEntries.filter((e) => !e.folderId).slice(0, 6);
    unfiled.forEach((entry, ei) => {
      const ex = cx - 40 + ei * 28;
      const ey = cy + 90;
      const entryNodeId = `entry-${entry.id}`;
      nodes.push({
        id: entryNodeId,
        type: 'entry',
        label: entry.title,
        x: ex,
        y: ey,
        radius: 12 + Math.round(computeHeat(entry, maxReviews) * 6),
        color,
        opacity: 0.6 + computeHeat(entry, maxReviews) * 0.4,
        spaceKey: space.key,
        folderId: null,
        entryId: entry.id,
        reviewStatus: getReviewStatus(entry),
        connectionCount: connectionCountByEntry.get(entry.id) ?? 0,
        heat: computeHeat(entry, maxReviews),
        entryType: entry.entryType,
        category: entry.category,
        tags: entry.tags,
        createdAt: entry.createdAt,
      });
      hierarchyEdges.push({
        id: `h-${spaceNodeId}-${entryNodeId}`,
        from: spaceNodeId,
        to: entryNodeId,
        kind: 'hierarchy',
      });
    });
  });

  const mostConnected = [...visibleEntries].sort(
    (a, b) => (connectionCountByEntry.get(b.id) ?? 0) - (connectionCountByEntry.get(a.id) ?? 0),
  )[0];

  const spaceCounts = VAULT_SPACES.map((s) => ({
    key: s.key,
    label: s.label,
    count: entries.filter((e) => e.spaceKey === s.key).length,
  }));
  const leastExplored = [...spaceCounts].sort((a, b) => a.count - b.count).find((s) => s.count >= 0);

  const exploredSpaces = spaceCounts.filter((s) => s.count > 0).length;
  const brainCompletionPct = Math.min(
    100,
    Math.round((visibleEntries.length / Math.max(entries.length, 1)) * 60 + exploredSpaces * 4),
  );

  const metrics: KnowledgeGraphMetrics = {
    totalNotes: visibleEntries.length,
    totalConnections: relationEdges.length,
    knowledgeAreas: exploredSpaces,
    mostConnectedTopic: mostConnected?.title ?? null,
    leastExploredArea: leastExplored ? VAULT_SPACE_BY_KEY[leastExplored.key]?.label ?? null : null,
    reviewsDue: dueReviewCount,
    networkStrength: totalConnectionCount,
    brainCompletionPct,
    explorerScore: exploredSpaces,
  };

  return {
    nodes,
    edges: [...hierarchyEdges, ...relationEdges],
    metrics,
    canvasWidth,
    canvasHeight,
  };
};

export const getRelatedNodeIds = (
  nodeId: string,
  edges: KnowledgeGraphEdge[],
): Set<string> => {
  const related = new Set<string>();
  for (const edge of edges) {
    if (edge.from === nodeId) related.add(edge.to);
    if (edge.to === nodeId) related.add(edge.from);
  }
  return related;
};

export const buildLearningPath = (
  startEntryId: string,
  nodes: KnowledgeGraphNode[],
  edges: KnowledgeGraphEdge[],
  maxDepth = 4,
): KnowledgeGraphNode[] => {
  const entryNodes = nodes.filter((n) => n.type === 'entry' && n.entryId);
  const byId = new Map(entryNodes.map((n) => [n.id, n]));
  const startNodeId = `entry-${startEntryId}`;
  if (!byId.has(startNodeId)) return [];

  const adjacency = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.kind !== 'relation') continue;
    const a = adjacency.get(edge.from) ?? [];
    a.push(edge.to);
    adjacency.set(edge.from, a);
    const b = adjacency.get(edge.to) ?? [];
    b.push(edge.from);
    adjacency.set(edge.to, b);
  }

  const path: KnowledgeGraphNode[] = [];
  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = [{ id: startNodeId, depth: 0 }];
  visited.add(startNodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const node = byId.get(current.id);
    if (node) path.push(node);
    if (current.depth >= maxDepth) continue;
    for (const next of adjacency.get(current.id) ?? []) {
      if (visited.has(next)) continue;
      visited.add(next);
      queue.push({ id: next, depth: current.depth + 1 });
    }
  }

  return path;
};
