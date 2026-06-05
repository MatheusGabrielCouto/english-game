import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isVaultCollectionsSliceKey,
  isVaultEntriesSliceKey,
  isVaultMetaSliceKey,
  VAULT_COLLECTIONS_SLICE_KEYS,
  VAULT_ENTRIES_SLICE_KEYS,
  VAULT_META_SLICE_KEYS,
} from '../vault-store-slices'

describe('vault store slices (P-45)', () => {
  it('partitions refresh payload fields without overlap', () => {
    const all = [
      ...VAULT_ENTRIES_SLICE_KEYS,
      ...VAULT_META_SLICE_KEYS,
      ...VAULT_COLLECTIONS_SLICE_KEYS,
    ]
    const unique = new Set(all)

    assert.equal(unique.size, all.length)
    assert.equal(all.length, 11)
  })

  it('classifies slice keys', () => {
    assert.equal(isVaultEntriesSliceKey('entries'), true)
    assert.equal(isVaultEntriesSliceKey('stats'), false)
    assert.equal(isVaultMetaSliceKey('isLoading'), true)
    assert.equal(isVaultCollectionsSliceKey('mapTree'), true)
    assert.equal(isVaultCollectionsSliceKey('pinned'), false)
  })
})
