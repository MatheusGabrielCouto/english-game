import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { getSkeletonStaggerDelay, SKELETON_STAGGER } from '../skeleton-stagger'

describe('skeleton-stagger', () => {
  it('computes increasing delays per index', () => {
    assert.equal(getSkeletonStaggerDelay(0), 0)
    assert.equal(getSkeletonStaggerDelay(2), 160)
    assert.equal(getSkeletonStaggerDelay(3, SKELETON_STAGGER.blockStepMs), 165)
  })

  it('never returns negative delay', () => {
    assert.equal(getSkeletonStaggerDelay(-2), 0)
  })
})
