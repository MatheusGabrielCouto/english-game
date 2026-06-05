import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { shouldRunHomeInfiniteAnimations } from '../home-infinite-animation-policy'

describe('home infinite animation policy (P-41)', () => {
  it('runs when tab is focused and reduce motion is off', () => {
    assert.equal(shouldRunHomeInfiniteAnimations(true, false), true)
  })

  it('pauses when tab is blurred', () => {
    assert.equal(shouldRunHomeInfiniteAnimations(false, false), false)
  })

  it('pauses when reduce motion is enabled', () => {
    assert.equal(shouldRunHomeInfiniteAnimations(true, true), false)
  })

  it('pauses when blurred and reduce motion is enabled', () => {
    assert.equal(shouldRunHomeInfiniteAnimations(false, true), false)
  })
})
