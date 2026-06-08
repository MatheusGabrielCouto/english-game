import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { RoutineCategory } from '@/types/routine'
import { LearningSkillKey } from '@/types/learning-gps'

import {
  DEFAULT_ROUTINE_GPS_MINUTES,
  resolveRoutineSkillKey,
  routineDurationToGpsMinutes,
} from '@/features/learning-gps/utils/map-routine-category-to-skill'

describe('map-routine-category-to-skill', () => {
  it('maps speaking routines to speaking skill', () => {
    assert.equal(resolveRoutineSkillKey(RoutineCategory.SPEAKING), LearningSkillKey.SPEAKING)
  })

  it('maps grammar routines to grammar skill', () => {
    assert.equal(resolveRoutineSkillKey(RoutineCategory.GRAMMAR), LearningSkillKey.GRAMMAR)
  })

  it('uses expected duration when provided', () => {
    assert.equal(routineDurationToGpsMinutes(30), 30)
  })

  it('falls back to default minutes', () => {
    assert.equal(routineDurationToGpsMinutes(null), DEFAULT_ROUTINE_GPS_MINUTES)
  })
})
