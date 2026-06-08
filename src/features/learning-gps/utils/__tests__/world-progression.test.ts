import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningUnitStatus, LearningWorldKey } from '@/types/learning-gps'

import {
  getCheckpointUnitKey,
  getNextWorldKey,
  isCheckpointCompletedForWorld,
  isWorldUnlocked,
  resolveCompletedWorldKeys,
} from '@/features/learning-gps/utils/world-progression'

const survivorWorld = {
  key: LearningWorldKey.SURVIVOR,
  name: 'Survivor',
  emoji: '🏕️',
  cefrLevel: 'A1',
  sortOrder: 1,
  estimatedDaysMin: 30,
  estimatedDaysMax: 60,
  goalDescription: '2 min',
  description: null,
}

const explorerWorld = {
  key: LearningWorldKey.EXPLORER,
  name: 'Explorer',
  emoji: '🧭',
  cefrLevel: 'A2',
  sortOrder: 2,
  estimatedDaysMin: 60,
  estimatedDaysMax: 90,
  goalDescription: '5 min',
  description: null,
}

describe('world-progression', () => {
  it('returns next world in progression order', () => {
    assert.equal(getNextWorldKey(LearningWorldKey.SURVIVOR), LearningWorldKey.EXPLORER)
    assert.equal(getNextWorldKey(LearningWorldKey.LEGEND), null)
  })

  it('finds checkpoint unit key per world', () => {
    assert.equal(
      getCheckpointUnitKey(LearningWorldKey.SURVIVOR),
      'survivor_checkpoint_conversation',
    )
    assert.equal(
      getCheckpointUnitKey(LearningWorldKey.EXPLORER),
      'explorer_checkpoint_conversation',
    )
  })

  it('unlocks worlds up to current world sort order', () => {
    assert.equal(isWorldUnlocked(survivorWorld, survivorWorld), true)
    assert.equal(isWorldUnlocked(explorerWorld, survivorWorld), false)
    assert.equal(isWorldUnlocked(explorerWorld, explorerWorld), true)
  })

  it('detects completed worlds from checkpoint progress', () => {
    const progress = [
      {
        unitKey: 'survivor_checkpoint_conversation',
        worldKey: LearningWorldKey.SURVIVOR,
        status: LearningUnitStatus.COMPLETED,
        practiceProgress: 2,
        completedAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ]

    assert.equal(isCheckpointCompletedForWorld(LearningWorldKey.SURVIVOR, progress), true)
    assert.equal(isCheckpointCompletedForWorld(LearningWorldKey.EXPLORER, progress), false)

    const completed = resolveCompletedWorldKeys([survivorWorld, explorerWorld], progress)
    assert.deepEqual(completed, [LearningWorldKey.SURVIVOR])
  })
})
