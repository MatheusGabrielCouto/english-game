import { FULL_COLLECTIBLE_CATALOG } from '@/features/game-design/catalogs/collectible-catalog';
import { LOOT_RARITY_DROP_WEIGHTS } from '@/features/game-design/catalogs/loot-economy';
import type { CollectibleDefinition } from '@/types/collectible';
import type { LootBoxRarityValue } from '@/types/inventory';

const pickWeightedRarity = (
  boxRarity: LootBoxRarityValue,
  random = Math.random(),
): CollectibleDefinition['rarity'] => {
  const weights = LOOT_RARITY_DROP_WEIGHTS[boxRarity] ?? LOOT_RARITY_DROP_WEIGHTS.common;
  const entries = Object.entries(weights);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = random * total;

  for (const [rarity, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return rarity as CollectibleDefinition['rarity'];
  }

  return entries[entries.length - 1][0] as CollectibleDefinition['rarity'];
};

export const pickCollectibleForLootBox = (
  boxRarity: LootBoxRarityValue,
  random = Math.random(),
  lootLuck = 0,
): CollectibleDefinition => {
  const adjustedRandom = Math.min(0.995, random + lootLuck * (1 - random) * 0.65);
  const targetRarity = pickWeightedRarity(boxRarity, adjustedRandom);
  const pool = FULL_COLLECTIBLE_CATALOG.filter((item) => item.rarity === targetRarity);
  const fallback = FULL_COLLECTIBLE_CATALOG;
  const source = pool.length > 0 ? pool : fallback;
  const index = Math.floor(random * source.length) % source.length;
  return source[index] ?? fallback[0];
};
