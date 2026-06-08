import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey, type DailyStudyBlock } from '@/types/learning-gps'

import { prioritizeDailyBlocks } from '@/features/learning-gps/utils/prioritize-daily-blocks'

const blocks: DailyStudyBlock[] = [
  {
    id: '0-vocabulario',
    skillKey: LearningSkillKey.VOCABULARY,
    minutes: 10,
    label: 'Vocabulário',
    emoji: '📝',
    progressMinutes: 0,
    completed: false,
  },
  {
    id: '1-leitura',
    skillKey: LearningSkillKey.READING,
    minutes: 10,
    label: 'Leitura',
    emoji: '📖',
    progressMinutes: 0,
    completed: false,
  },
  {
    id: '2-speaking',
    skillKey: LearningSkillKey.SPEAKING,
    minutes: 10,
    label: 'Conversação',
    emoji: '🗣️',
    progressMinutes: 0,
    completed: false,
  },
]

describe('prioritize-daily-blocks', () => {
  it('moves priority skills to the front', () => {
    const sorted = prioritizeDailyBlocks(blocks, [LearningSkillKey.SPEAKING, LearningSkillKey.READING])
    assert.equal(sorted[0]?.skillKey, LearningSkillKey.SPEAKING)
    assert.equal(sorted[1]?.skillKey, LearningSkillKey.READING)
  })

  it('keeps order when no priorities', () => {
    const sorted = prioritizeDailyBlocks(blocks, [])
    assert.equal(sorted[0]?.id, blocks[0]?.id)
  })
})
