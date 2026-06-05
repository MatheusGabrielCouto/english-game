import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { shouldRefreshStatistics } from '../statistics-refresh-policy'

describe('statistics refresh policy (P-42)', () => {
  it('skips mount refresh when dashboard is cached', () => {
    assert.equal(shouldRefreshStatistics('mount', true, false), false)
  })

  it('skips mount refresh while background hydrate is in flight', () => {
    assert.equal(shouldRefreshStatistics('mount', false, true), false)
  })

  it('refreshes on mount only when cache is empty and hydrate finished', () => {
    assert.equal(shouldRefreshStatistics('mount', false, false), true)
  })

  it('always refreshes when details section expands', () => {
    assert.equal(shouldRefreshStatistics('details_expand', true, false), true)
  })

  it('always refreshes on pull-to-refresh', () => {
    assert.equal(shouldRefreshStatistics('pull', true, false), true)
  })
})
