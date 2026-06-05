import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  filterRectsInViewport,
  getPaddedViewportRect,
  isRectVisibleInViewport,
  shouldCullCityMapViewport,
} from '../city-map-viewport-culling'

describe('city map viewport culling (P-44)', () => {
  it('enables culling when canvas exceeds viewport', () => {
    assert.equal(shouldCullCityMapViewport(800, 700, 360, 520), true)
    assert.equal(shouldCullCityMapViewport(360, 520, 360, 520), false)
  })

  it('detects rectangle intersection', () => {
    const viewport = { left: 100, top: 50, width: 200, height: 150 }
    assert.equal(
      isRectVisibleInViewport({ left: 250, top: 60, width: 40, height: 40 }, viewport),
      true,
    )
    assert.equal(
      isRectVisibleInViewport({ left: 400, top: 60, width: 40, height: 40 }, viewport),
      false,
    )
  })

  it('expands viewport with padding clamped to canvas', () => {
    const padded = getPaddedViewportRect(
      { x: 10, y: 20, width: 300, height: 400 },
      48,
      500,
      600,
    )

    assert.equal(padded.left, 0)
    assert.equal(padded.top, 0)
    assert.equal(padded.width, 358)
    assert.equal(padded.height, 468)
  })

  it('filters blocks outside padded viewport', () => {
    const blocks = [
      { left: 20, top: 30, width: 60, height: 50, id: 'visible' },
      { left: 900, top: 30, width: 60, height: 50, id: 'hidden' },
    ]

    const visible = filterRectsInViewport(
      blocks,
      { x: 0, y: 0, width: 360, height: 520 },
      1000,
      800,
      0,
    )

    assert.equal(visible.length, 1)
    assert.equal(visible[0]?.id, 'visible')
  })
})
