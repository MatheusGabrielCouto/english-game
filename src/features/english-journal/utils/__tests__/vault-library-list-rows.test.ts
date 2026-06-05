import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { JournalEntryRecord } from '@/types/journal'

import {
  buildVaultLibraryListRows,
  countVaultLibraryEntryRows,
} from '../vault-library-list-rows'

const entry = (id: string): JournalEntryRecord =>
  ({ id, title: `Note ${id}` }) as JournalEntryRecord

describe('vault library list rows (P-37)', () => {
  it('builds sections before entries', () => {
    const rows = buildVaultLibraryListRows({
      dueReviews: [entry('1')],
      pinned: [],
      mainEntries: [entry('2')],
      favorites: [],
      includeFavorites: false,
    })

    assert.equal(rows[0]?.kind, 'section')
    assert.equal(rows[1]?.kind, 'entry')
    assert.equal(countVaultLibraryEntryRows(rows), 2)
  })

  it('counts entries for virtualization threshold', () => {
    const mainEntries = Array.from({ length: 25 }, (_, i) => entry(String(i)))
    const rows = buildVaultLibraryListRows({
      dueReviews: [],
      pinned: [],
      mainEntries,
      favorites: [],
      includeFavorites: false,
    })

    assert.equal(countVaultLibraryEntryRows(rows), 25)
  })
})
