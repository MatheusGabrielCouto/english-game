import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { MentorAIContext } from '@/types/mentor-ai'

import { MentorExerciseEngine } from '../mentor-exercise-engine'

const mockContext = {
  learningGps: { worldCefr: 'A2' },
  skills: { weakest: 'speaking' },
} as MentorAIContext

describe('MentorExerciseEngine', () => {
  it('returns Past Simple set for matching topics', () => {
    const result = MentorExerciseEngine.tryGenerate('Past Simple', mockContext)

    assert.ok(result)
    assert.equal(result?.topic, 'past_simple')
    assert.equal(result?.questions.length, 5)
  })

  it('returns Present Perfect set for matching topics', () => {
    const result = MentorExerciseEngine.tryGenerate('present perfect review', mockContext)

    assert.ok(result)
    assert.equal(result?.topic, 'present_perfect')
  })

  it('returns travel set for travel topics', () => {
    const result = MentorExerciseEngine.tryGenerate('airport travel', mockContext)

    assert.ok(result)
    assert.equal(result?.topic, 'travel')
  })

  it('returns null for unknown topics', () => {
    assert.equal(MentorExerciseEngine.tryGenerate('quantum physics', mockContext), null)
  })
})
