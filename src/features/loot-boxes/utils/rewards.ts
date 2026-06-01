import type { LootBoxRarityValue } from '@/types/inventory';
import type { LootBoxReward } from '@/types/loot-box';

import { LOOT_BOX_REWARD_POOLS } from '../constants';

export const pickLootBoxReward = (
  boxRarity: LootBoxRarityValue,
  random = Math.random(),
): LootBoxReward => {
  const pool = LOOT_BOX_REWARD_POOLS[boxRarity];
  const totalWeight = pool.reduce((sum, entry) => sum + entry.weight, 0);
  let cursor = random * totalWeight;

  for (const entry of pool) {
    cursor -= entry.weight;
    if (cursor <= 0) return { ...entry.reward };
  }

  return { ...pool[pool.length - 1].reward };
};
