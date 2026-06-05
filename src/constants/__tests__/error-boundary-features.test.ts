import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ERROR_BOUNDARY_FEATURES,
  ERROR_BOUNDARY_UI,
  getErrorBoundaryFeature,
} from '../error-boundary-features'

describe('error boundary features (P-33)', () => {
  it('defines friendly copy for major features', () => {
    const required: Array<keyof typeof ERROR_BOUNDARY_FEATURES> = [
      'home',
      'play',
      'knowledge',
      'flash-deck',
      'english-journal',
      'duels',
      'pet-farm',
      'city',
      'pet',
      'inventory',
      'farm',
      'focus-mode',
    ]

    for (const featureId of required) {
      const copy = getErrorBoundaryFeature(featureId)
      assert.ok(copy.emoji.length > 0)
      assert.ok(copy.title.length > 8)
      assert.ok(copy.hint.length > 16)
    }
  })

  it('exposes shared fallback labels', () => {
    assert.equal(ERROR_BOUNDARY_UI.retryLabel, 'Tentar novamente')
    assert.equal(ERROR_BOUNDARY_UI.goBackLabel, 'Voltar')
    assert.ok(ERROR_BOUNDARY_FEATURES.menu.title.includes('Menu'))
  })
})
