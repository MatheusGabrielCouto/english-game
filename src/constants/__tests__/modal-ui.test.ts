import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { MODAL_BACKDROP, MODAL_SHEET_DISMISS, MODAL_SPRING } from '../modal-ui'

describe('modal-ui', () => {
  it('defines shared spring tuning', () => {
    assert.ok(MODAL_SPRING.damping > 0)
    assert.ok(MODAL_SPRING.stiffness > 0)
  })

  it('configures backdrop blur', () => {
    assert.equal(MODAL_BACKDROP.tint, 'dark')
    assert.ok(MODAL_BACKDROP.intensity > 0)
    assert.ok(MODAL_BACKDROP.androidOpacity > 0)
  })

  it('defines sheet dismiss thresholds', () => {
    assert.ok(MODAL_SHEET_DISMISS.distanceThreshold > 0)
    assert.ok(MODAL_SHEET_DISMISS.velocityThreshold > 0)
  })
})
