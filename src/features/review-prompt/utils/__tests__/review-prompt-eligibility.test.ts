import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { REVIEW_PROMPT_MOMENTS } from '../../constants/review-prompt-ui'
import {
  canRequestReviewPrompt,
  daysSinceIso,
  nextReviewPromptState,
} from '../review-prompt-eligibility'
import { resolveReviewMomentFromGameEvent } from '../review-prompt-triggers'

describe('review prompt eligibility (P-22)', () => {
  it('allows first prompt', () => {
    assert.equal(canRequestReviewPrompt({ promptCount: 0, lastPromptAtIso: null }), true)
  })

  it('blocks after max count', () => {
    assert.equal(
      canRequestReviewPrompt({ promptCount: 3, lastPromptAtIso: '2020-01-01T00:00:00.000Z' }),
      false,
    )
  })

  it('enforces cooldown window', () => {
    const recent = new Date('2026-06-01T12:00:00.000Z')
    assert.equal(
      canRequestReviewPrompt(
        { promptCount: 1, lastPromptAtIso: '2026-05-15T12:00:00.000Z' },
        recent,
      ),
      false,
    )
    assert.equal(
      canRequestReviewPrompt(
        { promptCount: 1, lastPromptAtIso: '2026-02-01T12:00:00.000Z' },
        recent,
      ),
      true,
    )
  })

  it('increments persisted state', () => {
    const next = nextReviewPromptState(
      { promptCount: 1, lastPromptAtIso: '2026-01-01T00:00:00.000Z' },
      '2026-06-05T00:00:00.000Z',
    )
    assert.equal(next.promptCount, 2)
    assert.equal(next.lastPromptAtIso, '2026-06-05T00:00:00.000Z')
  })

  it('daysSinceIso helper', () => {
    assert.equal(
      daysSinceIso('2026-06-01T00:00:00.000Z', new Date('2026-06-05T00:00:00.000Z')),
      4,
    )
  })

  it('triggers on 7-day streak and legendary loot only', () => {
    assert.equal(
      resolveReviewMomentFromGameEvent({ type: 'STUDY_DAY_RECORDED' }, 7),
      REVIEW_PROMPT_MOMENTS.STREAK_7,
    )
    assert.equal(resolveReviewMomentFromGameEvent({ type: 'STUDY_DAY_RECORDED' }, 6), null)
    assert.equal(
      resolveReviewMomentFromGameEvent(
        {
          type: 'LOOT_BOX_OPENED',
          result: {
            boxId: 1,
            boxRarity: 'legendary',
            reward: { type: 'coins', amount: 10, label: '10 moedas' },
          },
        },
        0,
      ),
      REVIEW_PROMPT_MOMENTS.LOOT_LEGENDARY,
    )
    assert.equal(
      resolveReviewMomentFromGameEvent(
        {
          type: 'LOOT_BOX_OPENED',
          result: {
            boxId: 1,
            boxRarity: 'epic',
            reward: { type: 'coins', amount: 10, label: '10 moedas' },
          },
        },
        0,
      ),
      null,
    )
  })
})
