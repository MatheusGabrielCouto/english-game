import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import {
    GAME_ITEM_CATALOG,
    ItemCategory,
} from '@/features/game-design/catalogs/item-catalog';
import { PET_SPECIES_BY_KEY, PET_SPECIES_CATALOG } from '@/features/game-design/catalogs/pet-species-catalog';
import { InventoryService } from '@/features/inventory/services/inventory-service';
import { useTitlesStore } from '@/features/titles/store/titles-store';
import { getDb } from '@/storage/database/client';
import { petCollection } from '@/storage/database/schema';
import type { CollectionCategoryDetail, CollectionSummary } from '@/types/metagame';

import { COLLECTION_META } from '../constants/collections-catalog';

const pct = (current: number, total: number): number =>
  total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

const buildCategory = (
  key: CollectionCategoryDetail['key'],
  discovered: number,
  total: number,
  preview: string[],
): CollectionCategoryDetail => {
  const meta = COLLECTION_META[key];
  return {
    key,
    label: meta.label,
    emoji: meta.emoji,
    description: meta.description,
    discovered,
    total,
    percentage: pct(discovered, total),
    tone: meta.tone,
    preview,
    hint: meta.hint,
  };
};

export const buildDetailedCollections = async (): Promise<CollectionSummary> => {
  const achievementsState = useAchievementsStore.getState();
  const titlesState = useTitlesStore.getState();
  const inventory = InventoryService.getCachedSnapshot();

  const db = getDb();
  const petRows = await db.select({ speciesKey: petCollection.speciesKey }).from(petCollection);
  const discoveredPetKeys = new Set(petRows.map((row) => row.speciesKey));

  if (inventory?.pet && discoveredPetKeys.size === 0) {
    discoveredPetKeys.add('codeowl');
  }

  const ownedItemKeys = new Set(inventory?.specialItems.map((item) => item.itemKey) ?? []);
  const relicCatalog = GAME_ITEM_CATALOG.filter((item) => item.category === ItemCategory.RELIC);
  const relicsUnlocked = relicCatalog.filter((item) => ownedItemKeys.has(item.key)).length;

  const itemsOwned = inventory?.analytics.totalItemsAcquired ?? ownedItemKeys.size;
  const itemsTotal = GAME_ITEM_CATALOG.length;

  const petPreview = [...discoveredPetKeys]
    .slice(0, 5)
    .map((key) => PET_SPECIES_BY_KEY[key]?.emoji ?? '🐾');

  const achievementPreview = achievementsState.achievements
    .filter((entry) => entry.unlockedAt !== null)
    .slice(0, 5)
    .map((entry) => entry.icon);

  const titlePreview = titlesState.titles
    .filter((entry) => entry.unlockedAt !== null)
    .slice(0, 5)
    .map((entry) => entry.icon);

  const itemPreview = inventory?.specialItems.slice(0, 5).map((item) => {
    const catalogItem = GAME_ITEM_CATALOG.find((entry) => entry.key === item.itemKey);
    return catalogItem?.icon ?? '📦';
  }) ?? ['📦'];

  const relicPreview = relicCatalog
    .filter((item) => ownedItemKeys.has(item.key))
    .slice(0, 5)
    .map((item) => item.icon);

  const petsDiscovered = Math.max(discoveredPetKeys.size, inventory?.pet ? 1 : 0);
  const petsTotal = PET_SPECIES_CATALOG.length;

  const categories: CollectionCategoryDetail[] = [
    buildCategory('pets', petsDiscovered, petsTotal, petPreview.length > 0 ? petPreview : ['🥚']),
    buildCategory('items', itemsOwned, itemsTotal, itemPreview),
    buildCategory('titles', titlesState.summary.unlocked, titlesState.summary.total, titlePreview.length > 0 ? titlePreview : ['👑']),
    buildCategory(
      'achievements',
      achievementsState.summary.unlocked,
      achievementsState.summary.total,
      achievementPreview.length > 0 ? achievementPreview : ['🏆'],
    ),
    buildCategory('relics', relicsUnlocked, relicCatalog.length, relicPreview.length > 0 ? relicPreview : ['💎']),
  ];

  const overallDiscovered = categories.reduce((sum, category) => sum + category.discovered, 0);
  const overallTotal = categories.reduce((sum, category) => sum + category.total, 0);

  return {
    overallPercentage: pct(overallDiscovered, overallTotal),
    categories,
    pets: { discovered: petsDiscovered, total: petsTotal },
    items: { owned: itemsOwned, total: itemsTotal },
    titles: { unlocked: titlesState.summary.unlocked, total: titlesState.summary.total },
    achievements: {
      unlocked: achievementsState.summary.unlocked,
      total: achievementsState.summary.total,
    },
    relics: { unlocked: relicsUnlocked, total: relicCatalog.length },
  };
};

export const getDiscoveredPetKeys = async (): Promise<Set<string>> => {
  const db = getDb();
  const petRows = await db.select({ speciesKey: petCollection.speciesKey }).from(petCollection);
  const keys = new Set(petRows.map((row) => row.speciesKey));
  const inventory = InventoryService.getCachedSnapshot();

  if (keys.size === 0 && inventory?.pet) {
    keys.add('codeowl');
  }

  return keys;
};
