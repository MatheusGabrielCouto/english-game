import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildRetentionCutoffIso } from '../build-retention-cutoff'

describe('mentor retention', () => {
  it('builds cutoff 90 days before now', () => {
    const now = new Date('2026-06-08T12:00:00.000Z')
    const cutoff = buildRetentionCutoffIso(90, now)

    assert.equal(cutoff, '2026-03-10T12:00:00.000Z')
  })

  it('builds cutoff for custom retention window', () => {
    const now = new Date('2026-06-08T12:00:00.000Z')
    const cutoff = buildRetentionCutoffIso(30, now)

    assert.equal(cutoff, '2026-05-09T12:00:00.000Z')
  })
})
