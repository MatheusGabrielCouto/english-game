import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildVaultLibraryFilter,
  isVaultUnfilteredListFilter,
  VAULT_LIBRARY_SEARCH_DEBOUNCE_MS,
} from '../vault-library-filter-ui'

describe('vault library filter (P-39)', () => {
  it('builds filter with space and trimmed search', () => {
    assert.deepEqual(buildVaultLibraryFilter(undefined, '  past '), {
      spaceKey: 'all',
      search: 'past',
    })
    assert.deepEqual(buildVaultLibraryFilter('grammar', ''), {
      spaceKey: 'grammar',
      search: undefined,
    })
  })

  it('detects unfiltered library queries', () => {
    assert.equal(isVaultUnfilteredListFilter({}), true)
    assert.equal(isVaultUnfilteredListFilter({ spaceKey: 'all' }), true)
    assert.equal(isVaultUnfilteredListFilter({ search: 'foo' }), false)
    assert.equal(isVaultUnfilteredListFilter({ spaceKey: 'grammar' }), false)
  })

  it('uses debounce aligned with global vault search', () => {
    assert.equal(VAULT_LIBRARY_SEARCH_DEBOUNCE_MS, 280)
  })
})
