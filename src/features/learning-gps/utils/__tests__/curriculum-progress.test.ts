import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningWorldKey } from '@/types/learning-gps'

import {
    applyPracticeCredit,
    computeWorldProgressFromUnits,
    unlockNextUnit,
} from '@/features/learning-gps/utils/curriculum-progress'
import { LearningUnitKind, LearningUnitStatus } from '@/types/learning-gps'

const unit = {
  key: 'survivor_alphabet',
  worldKey: LearningWorldKey.SURVIVOR,
  kind: LearningUnitKind.VOCABULARY,
  title: 'Alfabeto',
  emoji: '🔤',
  description: 'Test',
  practiceRoute: '/farm',
  practiceLabel: 'Farm',
  practiceActivity: 'vocabulary',
  requiredPracticeAmount: 5,
  sortOrder: 1,
}

const progress = {
  unitKey: unit.key,
  worldKey: unit.worldKey,
  status: LearningUnitStatus.AVAILABLE,
  practiceProgress: 0,
  completedAt: null,
  updatedAt: '2026-01-01',
}

describe('curriculum-progress', () => {
  it('completes unit when practice reaches target', () => {
    const result = applyPracticeCredit(unit, progress, 5)
    assert.equal(result.completed, true)
    assert.equal(result.progress.status, LearningUnitStatus.COMPLETED)
  })

  it('unlocks next unit after completion', () => {
    const units = [
      {
        ...unit,
        progress: { ...progress, status: LearningUnitStatus.COMPLETED },
      },
      {
        ...unit,
        key: 'survivor_numbers',
        sortOrder: 2,
        progress: {
          ...progress,
          unitKey: 'survivor_numbers',
          status: LearningUnitStatus.LOCKED,
        },
      },
    ]

    const next = unlockNextUnit(units, unit.key)
    assert.equal(next?.status, LearningUnitStatus.AVAILABLE)
  })

  it('computes world progress from completed units', () => {
    const percent = computeWorldProgressFromUnits([
      { ...unit, progress: { ...progress, status: LearningUnitStatus.COMPLETED } },
      {
        ...unit,
        key: 'b',
        progress: { ...progress, unitKey: 'b', status: LearningUnitStatus.AVAILABLE },
      },
    ])
    assert.equal(percent, 50)
  })
})
