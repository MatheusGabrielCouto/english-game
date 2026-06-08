import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { MentorCorrectionCategory } from '@/types/mentor-ai'

import { buildErrorPracticePlan, dedupeErrors } from '../build-error-practice-plan'
import { buildExerciseSetFromErrors } from '../build-questions-from-errors'

const makeError = (id: string, original: string, corrected: string, category: string) => ({
  id,
  original,
  corrected,
  category,
  occurredAt: '2026-06-01T12:00:00.000Z',
})

describe('buildExerciseSetFromErrors', () => {
  it('builds personalized questions from saved corrections', () => {
    const set = buildExerciseSetFromErrors([
      makeError(
        'e1',
        'I have 30 years old',
        'I am 30 years old',
        MentorCorrectionCategory.GRAMMAR_AGREEMENT,
      ),
      makeError(
        'e2',
        'I am agree with you',
        'I agree with you',
        MentorCorrectionCategory.GRAMMAR_AGREEMENT,
      ),
    ])

    assert.ok(set)
    assert.equal(set?.topic, 'my_frequent_errors')
    assert.equal(set?.questions.length, 2)
    const first = set?.questions[0]
    assert.equal(first?.options[first.correctIndex], 'I am 30 years old')
  })

  it('deduplicates repeated originals', () => {
    const unique = dedupeErrors([
      makeError('e1', 'I have 30 years old', 'I am 30 years old', MentorCorrectionCategory.OTHER),
      makeError('e2', 'I have 30 years old', 'I am 30 years old', MentorCorrectionCategory.OTHER),
    ])

    assert.equal(unique.length, 1)
  })

  it('ranks top categories for the practice plan', () => {
    const plan = buildErrorPracticePlan([
      makeError('e1', 'I have 30 years old', 'I am 30 years old', MentorCorrectionCategory.GRAMMAR_TENSE),
      makeError('e2', 'I am agree', 'I agree', MentorCorrectionCategory.GRAMMAR_AGREEMENT),
      makeError('e3', 'I have been to there', 'I have been there', MentorCorrectionCategory.PREPOSITION),
    ])

    assert.ok(plan.llmPrompt.includes('Tempos verbais') || plan.llmPrompt.includes('grammar_tense'))
    assert.equal(plan.topicLabel, 'Meus erros frequentes')
  })
})
