import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    computeEpicMissionPercentage,
    formatEpicMissionProgress,
    resolvePlayerLevelMissionProgress,
} from '../epic-quest-progress'

describe('resolvePlayerLevelMissionProgress', () => {
  it('uses current player level capped by target', () => {
    assert.equal(resolvePlayerLevelMissionProgress(11, 50), 11)
    assert.equal(resolvePlayerLevelMissionProgress(50, 50), 50)
    assert.equal(resolvePlayerLevelMissionProgress(80, 50), 50)
  })
})

describe('computeEpicMissionPercentage', () => {
  it('reflects level progress for PLAYER_LEVEL missions', () => {
    assert.equal(computeEpicMissionPercentage(11, 50), 22)
    assert.equal(computeEpicMissionPercentage(50, 50), 100)
  })
})

describe('formatEpicMissionProgress', () => {
  it('labels level missions clearly', () => {
    assert.equal(
      formatEpicMissionProgress({
        missionType: 'PLAYER_LEVEL',
        currentValue: 11,
        targetValue: 50,
      }),
      'Nível 11 / 50',
    )
  })
})
