import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  REWARD_BURST_COPY,
  resolveRewardBurstBorder,
  resolveRewardBurstEmoji,
} from '../reward-burst-ui'

describe('reward-burst-ui', () => {
  it('resolves emoji and border per source', () => {
    assert.equal(resolveRewardBurstEmoji('routine'), '📋')
    assert.equal(resolveRewardBurstEmoji('vault'), '📚')
    assert.equal(resolveRewardBurstEmoji('focus'), '🎯')
    assert.match(resolveRewardBurstBorder('focus'), /accent/)
  })

  it('falls back to mission styling when source is missing', () => {
    assert.equal(resolveRewardBurstEmoji(), '✅')
    assert.match(resolveRewardBurstBorder(), /success/)
  })

  it('uses vault copy for vault reviews', () => {
    assert.match(REWARD_BURST_COPY.vault, /Vault/)
  })
})
