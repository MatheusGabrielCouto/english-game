import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { mergeRewardBursts } from '../merge-reward-burst'

describe('mergeRewardBursts', () => {
  it('sums rewards and marks batch count', () => {
    const merged = mergeRewardBursts(
      {
        id: '1',
        source: 'routine',
        title: 'Rotina A',
        xp: 10,
        coins: 2,
        batchCount: 1,
      },
      {
        source: 'focus',
        title: 'Foco',
        xp: 5,
        coins: 1,
      },
    )

    assert.equal(merged.xp, 15)
    assert.equal(merged.coins, 3)
    assert.equal(merged.batchCount, 2)
    assert.equal(merged.title, 'Recompensas conquistadas!')
  })
})
