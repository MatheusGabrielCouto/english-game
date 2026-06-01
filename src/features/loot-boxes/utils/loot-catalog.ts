import { FULL_COLLECTIBLE_CATALOG } from '@/features/game-design/catalogs/collectible-catalog';
import { LOOT_RARITY_DROP_WEIGHTS } from '@/features/game-design/catalogs/loot-economy';
import { LOOT_BOX_REWARD_POOLS, LOOT_BOX_RARITY_LABELS } from '@/features/loot-boxes/constants';
import type { CollectibleDefinition, CollectibleRarityValue } from '@/types/collectible';
import type { LootBoxRarityValue } from '@/types/inventory';
import { LootBoxRewardType, type LootBoxRewardTypeValue } from '@/types/loot-box';

export type LootPoolDisplayEntry = {
  key: string;
  label: string;
  type: LootBoxRewardTypeValue;
  category: string;
  weight: number;
  chancePercent: number;
  itemKey?: string;
  upgradeRarity?: LootBoxRarityValue;
};

export type CollectibleDropTier = {
  rarity: CollectibleRarityValue;
  weight: number;
  chancePercent: number;
  items: CollectibleDefinition[];
};

export type LootBoxCatalogSnapshot = {
  boxRarity: LootBoxRarityValue;
  boxTitle: string;
  poolEntries: LootPoolDisplayEntry[];
  collectibleTiers: CollectibleDropTier[];
  eligibleCollectibles: CollectibleDefinition[];
};

const categorizeReward = (type: LootBoxRewardTypeValue, itemKey?: string): string => {
  if (type === LootBoxRewardType.COINS) return 'coins';
  if (type === LootBoxRewardType.SHIELD) return 'shields';
  if (type === LootBoxRewardType.STUDY_POINTS) return 'study_points';
  if (type === LootBoxRewardType.LOOT_BOX) return 'upgrade';
  if (type === LootBoxRewardType.COLLECTIBLE) return 'collectibles';
  if (itemKey?.includes('ticket')) return 'tickets';
  if (itemKey?.includes('pet')) return 'pets';
  if (itemKey?.includes('booster')) return 'consumables';
  return 'special';
};

export const buildLootPoolEntries = (boxRarity: LootBoxRarityValue): LootPoolDisplayEntry[] => {
  const pool = LOOT_BOX_REWARD_POOLS[boxRarity];
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);

  return pool.map((entry, index) => ({
    key: `${boxRarity}-pool-${index}`,
    label: entry.reward.label,
    type: entry.reward.type,
    category: categorizeReward(entry.reward.type, entry.reward.itemKey),
    weight: entry.weight,
    chancePercent: totalWeight > 0 ? Math.round((entry.weight / totalWeight) * 1000) / 10 : 0,
    itemKey: entry.reward.itemKey,
    upgradeRarity: entry.reward.rarity,
  }));
};

export const buildCollectibleDropTiers = (boxRarity: LootBoxRarityValue): CollectibleDropTier[] => {
  const weights = LOOT_RARITY_DROP_WEIGHTS[boxRarity] ?? {};
  const total = Object.values(weights).reduce((sum, w) => sum + w, 0);

  return Object.entries(weights).map(([rarity, weight]) => ({
    rarity: rarity as CollectibleRarityValue,
    weight,
    chancePercent: total > 0 ? Math.round((weight / total) * 1000) / 10 : 0,
    items: FULL_COLLECTIBLE_CATALOG.filter((item) => item.rarity === rarity),
  }));
};

/** Collectibles that can drop from this box (union of eligible rarities). */
export const getEligibleCollectibles = (boxRarity: LootBoxRarityValue): CollectibleDefinition[] => {
  const tiers = buildCollectibleDropTiers(boxRarity);
  const rarities = new Set(tiers.map((tier) => tier.rarity));
  return FULL_COLLECTIBLE_CATALOG.filter((item) => rarities.has(item.rarity));
};

export const buildLootBoxCatalogSnapshot = (boxRarity: LootBoxRarityValue): LootBoxCatalogSnapshot => ({
  boxRarity,
  boxTitle: LOOT_BOX_RARITY_LABELS[boxRarity],
  poolEntries: buildLootPoolEntries(boxRarity),
  collectibleTiers: buildCollectibleDropTiers(boxRarity),
  eligibleCollectibles: getEligibleCollectibles(boxRarity),
});

export const getCollectibleDropChance = (
  boxRarity: LootBoxRarityValue,
  itemRarity: CollectibleRarityValue,
): number => {
  const pool = buildLootPoolEntries(boxRarity);
  const collectibleEntry = pool.find((entry) => entry.type === LootBoxRewardType.COLLECTIBLE);
  if (!collectibleEntry) return 0;

  const tier = buildCollectibleDropTiers(boxRarity).find((t) => t.rarity === itemRarity);
  if (!tier) return 0;

  const itemsInTier = tier.items.length || 1;
  return Math.round(((collectibleEntry.chancePercent * tier.chancePercent) / 100 / itemsInTier) * 100) / 100;
};
