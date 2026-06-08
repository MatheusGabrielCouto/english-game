import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { inferContentKind, resolveRotationWeight } from '../motivation-mappers'

describe('motivation mappers', () => {
  it('infers text when only body is present', () => {
    assert.equal(inferContentKind({ body: 'Keep going' }), 'text')
  })

  it('infers mixed when multiple media kinds exist', () => {
    assert.equal(
      inferContentKind({
        body: 'Dream big',
        images: ['file:///img.jpg'],
        links: [{ url: 'https://example.com', title: null, description: null }],
      }),
      'mixed',
    )
  })

  it('weights pinned and favorite sparks higher', () => {
    assert.equal(
      resolveRotationWeight({ isPinned: true, isFavorite: true, importance: 'high' }),
      7,
    )
  })
})
