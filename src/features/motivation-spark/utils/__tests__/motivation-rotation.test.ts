import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { MotivationDailyPickRecord, MotivationSparkRecord } from '@/types/motivation-spark'

import {
    getRecentSparkIds,
    pickDailyMotivationSpark,
    pickWeightedSpark,
} from '../motivation-rotation'

const spark = (id: string, overrides: Partial<MotivationSparkRecord> = {}): MotivationSparkRecord => ({
  id,
  title: id,
  body: `Body ${id}`,
  contentKind: 'text',
  images: [],
  audioUri: null,
  audioDurationMs: null,
  audioTranscript: null,
  links: [],
  collectionId: null,
  tags: [],
  importance: 'medium',
  isFavorite: false,
  isPinned: false,
  isArchived: false,
  rotationWeight: 1,
  lastShownAt: null,
  showCount: 0,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('motivation rotation', () => {
  it('excludes recent spark ids within avoid window', () => {
    const picks: MotivationDailyPickRecord[] = [
      { dateKey: '2026-06-01', sparkId: 'a', notifiedAt: null, eveningNotifiedAt: null, openedAt: null },
      { dateKey: '2026-06-05', sparkId: 'b', notifiedAt: null, eveningNotifiedAt: null, openedAt: null },
    ]

    const recent = getRecentSparkIds(picks, 7, '2026-06-08')
    assert.equal(recent.has('a'), true)
    assert.equal(recent.has('b'), true)
  })

  it('picks deterministically for the same date key', () => {
    const sparks = [spark('a'), spark('b'), spark('c')]
    const first = pickWeightedSpark(sparks, '2026-06-08')
    const second = pickWeightedSpark(sparks, '2026-06-08')
    assert.equal(first?.id, second?.id)
  })

  it('avoids repeating recent sparks when possible', () => {
    const sparks = [spark('a'), spark('b')]
    const picks: MotivationDailyPickRecord[] = [
      { dateKey: '2026-06-07', sparkId: 'a', notifiedAt: null, eveningNotifiedAt: null, openedAt: null },
    ]

    const chosen = pickDailyMotivationSpark({
      dateKey: '2026-06-08',
      sparks,
      recentPicks: picks,
      avoidRepeatDays: 7,
    })

    assert.equal(chosen?.id, 'b')
  })
})
