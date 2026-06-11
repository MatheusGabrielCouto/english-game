import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    buildJournalSearchLikeClause,
    splitJournalSearchTerms,
} from '../repositories/journal-search-query'

describe('splitJournalSearchTerms', () => {
  it('splits and normalizes terms', () => {
    assert.deepEqual(splitJournalSearchTerms('Hello World'), ['hello', 'world'])
  })

  it('ignores short tokens', () => {
    assert.deepEqual(splitJournalSearchTerms('a'), [])
    assert.deepEqual(splitJournalSearchTerms('  '), [])
  })

  it('strips fts punctuation', () => {
    assert.deepEqual(splitJournalSearchTerms('foo"bar*baz'), ['foobarbaz'])
  })
})

describe('buildJournalSearchLikeClause', () => {
  it('builds AND clause for multiple terms', () => {
    assert.deepEqual(buildJournalSearchLikeClause('hello world'), {
      clause: 'search_text LIKE ? AND search_text LIKE ?',
      params: ['%hello%', '%world%'],
    })
  })

  it('returns null for empty input', () => {
    assert.equal(buildJournalSearchLikeClause('a'), null)
    assert.equal(buildJournalSearchLikeClause('  '), null)
  })
})
