import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { LootBoxRarity } from '@/types/inventory';

import { buildLootBoxSnapshot } from '../inventory';

describe('buildLootBoxSnapshot', () => {
  it('groups unopened loot boxes by rarity', () => {
    const snapshot = buildLootBoxSnapshot([
      {
        id: 1,
        rarity: LootBoxRarity.COMMON,
        source: 'system',
        acquiredAt: '2026-05-31T12:00:00.000Z',
        opened: false,
      },
      {
        id: 2,
        rarity: LootBoxRarity.RARE,
        source: 'system',
        acquiredAt: '2026-05-31T12:00:00.000Z',
        opened: false,
      },
      {
        id: 3,
        rarity: LootBoxRarity.RARE,
        source: 'system',
        acquiredAt: '2026-05-31T12:00:00.000Z',
        opened: false,
      },
    ]);

    assert.equal(snapshot.total, 3);
    assert.equal(snapshot.byRarity.common, 1);
    assert.equal(snapshot.byRarity.rare, 2);
    assert.equal(snapshot.byRarity.epic, 0);
  });
});
