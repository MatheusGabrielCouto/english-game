import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { computeMotivationOpenStreak, previousDateKey } from '../motivation-open-streak'

describe('motivation open streak', () => {
  it('computes consecutive days ending today', () => {
    const streak = computeMotivationOpenStreak(
      [
        { dateKey: '2026-06-08', sparkId: 'a', notifiedAt: null, openedAt: 't' },
        { dateKey: '2026-06-07', sparkId: 'a', notifiedAt: null, openedAt: 't' },
        { dateKey: '2026-06-05', sparkId: 'a', notifiedAt: null, openedAt: 't' },
      ],
      '2026-06-08',
    )

    assert.equal(streak.current, 2)
    assert.equal(streak.totalOpens, 3)
  })

  it('returns zero when yesterday and today are missing', () => {
    const streak = computeMotivationOpenStreak(
      [{ dateKey: '2026-06-01', sparkId: 'a', notifiedAt: null, openedAt: 't' }],
      '2026-06-08',
    )

    assert.equal(streak.current, 0)
  })

  it('steps back one calendar day', () => {
    assert.equal(previousDateKey('2026-06-08'), '2026-06-07')
  })
})
