import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningDifficulty } from '@/features/game-design/constants/difficulty'
import {
  buildDailyStudyBlocks,
  getTargetMinutesForDifficulty,
} from '@/features/learning-gps/utils/build-daily-study-blocks'

describe('buildDailyStudyBlocks', () => {
  it('returns 3 blocks for casual (15 min)', () => {
    const blocks = buildDailyStudyBlocks(LearningDifficulty.CASUAL)
    assert.equal(blocks.length, 3)
    assert.equal(
      blocks.reduce((sum, block) => sum + block.minutes, 0),
      15,
    )
  })

  it('returns 5 blocks for hardcore (90 min)', () => {
    const blocks = buildDailyStudyBlocks(LearningDifficulty.HARDCORE)
    assert.equal(blocks.length, 5)
    assert.equal(
      blocks.reduce((sum, block) => sum + block.minutes, 0),
      90,
    )
  })

  it('maps target minutes from difficulty config', () => {
    assert.equal(getTargetMinutesForDifficulty(LearningDifficulty.BALANCED), 30)
  })
})
