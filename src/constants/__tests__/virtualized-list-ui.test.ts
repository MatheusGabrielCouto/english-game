import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE,
  VIRTUALIZED_LIST_THRESHOLD,
} from '../virtualized-list-ui'

describe('virtualized list ui (P-31)', () => {
  it('uses threshold above typical short lists', () => {
    assert.equal(VIRTUALIZED_LIST_THRESHOLD, 20)
  })

  it('defines estimated sizes for audited surfaces', () => {
    assert.ok(VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.journalEntry > 0)
    assert.ok(VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.menuHubRow > 0)
    assert.ok(VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.flashCard > 0)
    assert.ok(VIRTUALIZED_LIST_ESTIMATED_ITEM_SIZE.inventoryHistory > 0)
  })
})
