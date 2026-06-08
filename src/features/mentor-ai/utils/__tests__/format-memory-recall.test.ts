import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildMemoryRecommendationLead,
  formatGoalRecall,
  shouldPrioritizeInterviewPractice,
} from '../format-memory-recall'

describe('format-memory-recall', () => {
  it('formats goals with intent prefix as direct recall', () => {
    assert.equal(
      formatGoalRecall('Quero trabalhar no exterior'),
      'Atlas lembra: Quero trabalhar no exterior',
    )
  })

  it('formats plain goals with você quer', () => {
    assert.equal(
      formatGoalRecall('vaga internacional'),
      'Atlas lembra que você quer vaga internacional',
    )
  })

  it('builds recommendation lead from primary goal', () => {
    const lead = buildMemoryRecommendationLead({
      goals: ['Conseguir vaga internacional'],
      preferences: [],
      frequentErrors: [],
      recentTopics: [],
    })

    assert.match(lead ?? '', /Atlas lembra/)
    assert.match(lead ?? '', /vaga internacional/i)
  })

  it('detects interview and international goals for practice priority', () => {
    assert.equal(
      shouldPrioritizeInterviewPractice({
        goals: ['Passar em entrevista frontend'],
        preferences: [],
        frequentErrors: [],
        recentTopics: [],
      }),
      true,
    )
  })
})
