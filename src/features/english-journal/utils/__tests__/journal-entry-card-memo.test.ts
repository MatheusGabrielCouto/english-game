import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { JournalEntryRecord } from '@/types/journal'

import { hasSameJournalEntryCardSnapshot } from '../journal-entry-card-memo'

const base = {
  id: '1',
  updatedAt: '2026-01-01',
  isFavorite: false,
  isPinned: false,
  nextReviewAt: null,
  title: 'Note',
  body: 'Body',
  audioUri: null,
  images: [],
} as JournalEntryRecord

describe('journal entry card memo (P-40)', () => {
  it('treats identical snapshots as equal', () => {
    assert.equal(hasSameJournalEntryCardSnapshot(base, { ...base }), true)
  })

  it('detects favorite toggle', () => {
    assert.equal(
      hasSameJournalEntryCardSnapshot(base, { ...base, isFavorite: true }),
      false,
    )
  })
})
