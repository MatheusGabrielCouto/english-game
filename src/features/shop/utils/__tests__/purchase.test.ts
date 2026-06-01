import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LootBoxRarity } from '@/types/inventory';
import { ShopCategory, ShopProductRewardType, type ShopProduct } from '@/types/shop';

import { canAffordProduct, getDeliveredQuantity } from '../purchase';

const shieldProduct = (): ShopProduct => ({
  key: 'shield_1',
  name: 'Escudo',
  description: 'Shield',
  category: ShopCategory.SHIELDS,
  price: 100,
  icon: '🛡️',
  reward: { type: ShopProductRewardType.SHIELD, quantity: 1 },
  available: true,
});

const lootBoxProduct = (): ShopProduct => ({
  key: 'loot_box_common',
  name: 'Loot Box Comum',
  description: 'Box',
  category: ShopCategory.LOOT_BOXES,
  price: 150,
  icon: '📦',
  reward: { type: ShopProductRewardType.LOOT_BOX, rarity: LootBoxRarity.COMMON, quantity: 1 },
  available: true,
});

describe('canAffordProduct', () => {
  it('returns true when balance meets price', () => {
    assert.equal(canAffordProduct(500, 100), true);
    assert.equal(canAffordProduct(100, 100), true);
  });

  it('returns false when balance is below price', () => {
    assert.equal(canAffordProduct(50, 150), false);
    assert.equal(canAffordProduct(0, 100), false);
  });
});

describe('getDeliveredQuantity', () => {
  it('returns shield quantity from reward', () => {
    assert.equal(getDeliveredQuantity(shieldProduct()), 1);
  });

  it('returns loot box quantity from reward', () => {
    assert.equal(getDeliveredQuantity(lootBoxProduct()), 1);
  });
});
