import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import type { MentorExerciseAnswerRecord } from '@/types/mentor-ai'

import { buildExerciseResultFeedback } from '../build-exercise-result-feedback'

const exerciseSet = {
  topic: 'past_simple',
  title: 'Past Simple',
  questions: [
    {
      prompt: 'She ___ yesterday.',
      options: ['go', 'went', 'gone', 'going'],
      correctIndex: 1,
      explanation: 'Past Simple de go é went.',
    },
    {
      prompt: 'They ___ (not / see) it.',
      options: ["didn't see", "don't see", "haven't seen", 'not saw'],
      correctIndex: 0,
      explanation: 'Negativa: did not + verbo base.',
    },
  ],
}

describe('buildExerciseResultFeedback', () => {
  it('celebrates a perfect score', () => {
    const answers: MentorExerciseAnswerRecord[] = [
      {
        questionIndex: 0,
        prompt: exerciseSet.questions[0].prompt,
        selectedIndex: 1,
        selectedOption: 'went',
        correctIndex: 1,
        correctOption: 'went',
        isCorrect: true,
        explanation: exerciseSet.questions[0].explanation,
      },
      {
        questionIndex: 1,
        prompt: exerciseSet.questions[1].prompt,
        selectedIndex: 0,
        selectedOption: "didn't see",
        correctIndex: 0,
        correctOption: "didn't see",
        isCorrect: true,
        explanation: exerciseSet.questions[1].explanation,
      },
    ]

    const feedback = buildExerciseResultFeedback(exerciseSet, answers)

    assert.equal(feedback.weaknesses.length, 0)
    assert.match(feedback.summary, /todas/i)
    assert.ok(feedback.improvements.length >= 2)
  })

  it('lists weaknesses for wrong answers', () => {
    const answers: MentorExerciseAnswerRecord[] = [
      {
        questionIndex: 0,
        prompt: exerciseSet.questions[0].prompt,
        selectedIndex: 0,
        selectedOption: 'go',
        correctIndex: 1,
        correctOption: 'went',
        isCorrect: false,
        explanation: exerciseSet.questions[0].explanation,
      },
    ]

    const feedback = buildExerciseResultFeedback(exerciseSet, answers)

    assert.equal(feedback.weaknesses.length, 1)
    assert.match(feedback.weaknesses[0], /go/)
    assert.match(feedback.weaknesses[0], /went/)
    assert.ok(feedback.improvements.length >= 2)
  })
})
