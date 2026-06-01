import { COLLECTIBLES_BY_CATEGORY, COLLECTIBLE_BY_KEY, COLLECTIBLE_CATALOG_STATS } from '@/features/game-design/catalogs/collectible-catalog';
import {
  discoverCollectionItem,
  getCollectionBookEntries,
} from '@/storage/repositories/collection-book-repository';
import type { CollectibleCategoryValue, CollectibleDefinition, CollectionBookEntry } from '@/types/collectible';
import { GameEvents } from '@/services/game-events';

import {
  type CollectionBookCategorySummary,
  useCollectionBookStore,
} from '../store/collection-book-store';

const CATEGORY_META: Record<CollectibleCategoryValue, { label: string; emoji: string }> = {
  relic: { label: 'Relíquias', emoji: '📕' },
  artifact: { label: 'Artefatos', emoji: '🔮' },
  mythic: { label: 'Míticos', emoji: '⚔️' },
  cosmetic: { label: 'Cosméticos', emoji: '🎨' },
  pet_exclusive: { label: 'Pets Exclusivos', emoji: '🐉' },
  ultra_rare: { label: 'Ultra Raros', emoji: '👑' },
};

const buildCategories = (entries: CollectionBookEntry[]): CollectionBookCategorySummary[] => {
  const discoveredByCategory = entries.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.category] = (acc[entry.category] ?? 0) + 1;
    return acc;
  }, {});

  return (Object.keys(COLLECTIBLES_BY_CATEGORY) as CollectibleCategoryValue[]).map((key) => {
    const meta = CATEGORY_META[key];
    const total = COLLECTIBLES_BY_CATEGORY[key].length;
    const discovered = discoveredByCategory[key] ?? 0;
    return {
      key,
      label: meta.label,
      emoji: meta.emoji,
      discovered,
      total,
      percentage: total > 0 ? Math.min(100, Math.round((discovered / total) * 100)) : 0,
    };
  });
};

const refreshStore = async (): Promise<void> => {
  const entries = await getCollectionBookEntries();
  const categories = buildCategories(entries);
  const totalDiscovered = entries.length;
  const overallPercentage =
    COLLECTIBLE_CATALOG_STATS.total > 0
      ? Math.min(100, Math.round((totalDiscovered / COLLECTIBLE_CATALOG_STATS.total) * 100))
      : 0;

  useCollectionBookStore.setState({
    entries,
    categories,
    overallPercentage,
    isLoading: false,
  });
};

export const CollectionBookService = {
  async initialize(): Promise<void> {
    await refreshStore();
  },

  async discover(itemKey: string): Promise<CollectibleDefinition | null> {
    const item = COLLECTIBLE_BY_KEY[itemKey];
    if (!item) return null;

    const created = await discoverCollectionItem(item.key, item.category, item.rarity);
    if (created) {
      GameEvents.emit({
        type: 'COLLECTIBLE_DISCOVERED',
        itemKey: item.key,
        name: item.name,
        category: item.category,
        rarity: item.rarity,
      });
      await refreshStore();
    }

    return item;
  },

  getCatalogForCategory(category: CollectibleCategoryValue): CollectibleDefinition[] {
    return COLLECTIBLES_BY_CATEGORY[category] ?? [];
  },

  isDiscovered(itemKey: string, entries: CollectionBookEntry[]): boolean {
    return entries.some((entry) => entry.itemKey === itemKey);
  },

  refresh: refreshStore,
};
