import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey, type DailyStudyBlock } from '@/types/learning-gps'

import {
    applyMinutesToBlock,
    pickBlockForFarmCredit,
} from '@/features/learning-gps/utils/apply-farm-credit-to-blocks'
import { farmAmountToGpsMinutes } from '@/features/learning-gps/utils/map-farm-activity-to-gps'
import { FarmActivityType } from '@/types/farm'

const block = (
  partial: Partial<DailyStudyBlock> & Pick<DailyStudyBlock, 'id' | 'skillKey' | 'minutes' | 'label'>,
): DailyStudyBlock => ({
  emoji: '📝',
  progressMinutes: 0,
  completed: false,
  ...partial,
})

describe('apply-farm-credit-to-blocks', () => {
  it('picks review block for farm review activity', () => {
    const blocks = [
      block({ id: '0-vocabulario', skillKey: LearningSkillKey.VOCABULARY, minutes: 5, label: 'Vocabulário' }),
      block({ id: '2-revisao', skillKey: LearningSkillKey.VOCABULARY, minutes: 5, label: 'Revisão' }),
    ]

    const picked = pickBlockForFarmCredit(blocks, {
      skillKey: LearningSkillKey.VOCABULARY,
      preferReviewBlock: true,
    })

    assert.equal(picked?.id, '2-revisao')
  })

  it('marks block completed when progress reaches target minutes', () => {
    const source = block({
      id: '0-vocabulario',
      skillKey: LearningSkillKey.READING,
      minutes: 10,
      label: 'Leitura',
      progressMinutes: 8,
    })

    const { block: updated, newlyCompleted } = applyMinutesToBlock(source, 2)
    assert.equal(updated.completed, true)
    assert.equal(updated.progressMinutes, 10)
    assert.equal(newlyCompleted, true)
  })
})

describe('farmAmountToGpsMinutes', () => {
  it('converts vocabulary words to study minutes', () => {
    assert.equal(farmAmountToGpsMinutes(FarmActivityType.VOCABULARY, 10), 5)
  })

  it('uses minutes directly for reading', () => {
    assert.equal(farmAmountToGpsMinutes(FarmActivityType.READING, 7), 7)
  })
})
