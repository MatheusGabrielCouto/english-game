import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LootBoxRarity } from '@/types/inventory';
import { LootBoxRewardType } from '@/types/loot-box';

import { pickLootBoxReward } from '../rewards';

describe('pickLootBoxReward', () => {
  it('returns coins for low random value on common box', () => {
    const reward = pickLootBoxReward(LootBoxRarity.COMMON, 0.1);
    assert.equal(reward.type, LootBoxRewardType.COINS);
  });

  it('can return an uncommon loot box from common pool at high random', () => {
    const reward = pickLootBoxReward(LootBoxRarity.COMMON, 0.99);
    assert.equal(reward.type, LootBoxRewardType.LOOT_BOX);
    assert.equal(reward.rarity, LootBoxRarity.UNCOMMON);
  });

  it('returns legendary-tier rewards from legendary pool', () => {
    const reward = pickLootBoxReward(LootBoxRarity.LEGENDARY, 0.5);
    assert.ok(reward.amount > 0);
  });
});
