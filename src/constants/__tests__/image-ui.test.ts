import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { IMAGE_BLURHASH, IMAGE_CACHE_POLICY, IMAGE_TRANSITION_MS } from '../image-ui'

describe('image ui (P-32)', () => {
  it('defines blurhash per surface', () => {
    assert.ok(IMAGE_BLURHASH.hero)
    assert.ok(IMAGE_BLURHASH.loot)
    assert.ok(IMAGE_BLURHASH.avatar)
    assert.ok(IMAGE_BLURHASH.journal)
  })

  it('uses disk cache and fade transition defaults', () => {
    assert.equal(IMAGE_CACHE_POLICY, 'memory-disk')
    assert.ok(IMAGE_TRANSITION_MS >= 150)
  })

  it('defines surfaces used by heroes and loot', () => {
    assert.ok(IMAGE_BLURHASH.hero)
    assert.ok(IMAGE_BLURHASH.loot)
  })
})
