import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getLootCelebrationLottieKind,
  isLootTier2Rarity,
  resolveLootRevealLottieKind,
} from '../celebration-lottie'

describe('celebration-lottie tier 2 helpers', () => {
  it('maps epic and legendary loot rarities', () => {
    assert.equal(getLootCelebrationLottieKind('epic'), 'lootEpic')
    assert.equal(getLootCelebrationLottieKind('legendary'), 'lootLegendary')
    assert.equal(getLootCelebrationLottieKind('mythic'), 'lootLegendary')
    assert.equal(getLootCelebrationLottieKind('rare'), null)
  })

  it('flags tier 2 loot rarities', () => {
    assert.equal(isLootTier2Rarity('epic'), true)
    assert.equal(isLootTier2Rarity('legendary'), true)
    assert.equal(isLootTier2Rarity('common'), false)
  })

  it('prefers legendary reward rarity over epic box', () => {
    assert.equal(resolveLootRevealLottieKind('epic', 'legendary'), 'lootLegendary')
    assert.equal(resolveLootRevealLottieKind('rare', 'epic'), 'lootEpic')
    assert.equal(resolveLootRevealLottieKind('legendary'), 'lootLegendary')
    assert.equal(resolveLootRevealLottieKind('common'), null)
  })
})
