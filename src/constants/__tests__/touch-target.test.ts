import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { MIN_TOUCH_TARGET_PT } from '../touch-target-ui'
import { resolveHitSlopForSize } from '@/utils/touch-target'

describe('touch target (P-16)', () => {
  it('icon hitSlop reaches 44pt from 20pt visual', () => {
    const slop = resolveHitSlopForSize(20, 20)
    assert.equal(20 + slop.left + slop.right, MIN_TOUCH_TARGET_PT)
    assert.equal(20 + slop.top + slop.bottom, MIN_TOUCH_TARGET_PT)
  })

  it('no extra slop when already at minimum', () => {
    const slop = resolveHitSlopForSize(48, 48)
    assert.equal(slop.top, 0)
    assert.equal(slop.left, 0)
  })
})
