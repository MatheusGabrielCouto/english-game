import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey, type DailyStudyBlock } from '@/types/learning-gps'

import { applyRoutineCreditToBlocks } from '@/features/learning-gps/utils/apply-routine-credit-to-blocks'

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
]

describe('apply-routine-credit-to-blocks', () => {
  it('credits matching skill block from routine', () => {
    const result = applyRoutineCreditToBlocks(blocks, LearningSkillKey.READING, 10)
    assert.equal(result.updatedBlock?.id, '1-leitura')
    assert.equal(result.newlyCompleted, true)
  })

  it('marks block completed when credit reaches target', () => {
    const result = applyRoutineCreditToBlocks(blocks, LearningSkillKey.VOCABULARY, 10)
    assert.equal(result.updatedBlock?.completed, true)
  })
})
