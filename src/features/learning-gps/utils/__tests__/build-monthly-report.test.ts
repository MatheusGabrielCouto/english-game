import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey, LearningWorldKey } from '@/types/learning-gps'

import { buildMonthlyReport } from '@/features/learning-gps/utils/build-monthly-report'

const world = {
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

describe('build-monthly-report', () => {
  it('builds report with goals from weaknesses and curriculum', () => {
    const report = buildMonthlyReport({
      dateKey: '2026-06-08',
      profile: {
        id: 1,
        currentWorldKey: LearningWorldKey.SURVIVOR,
        worldProgress: 25,
        learningGpsOnboarded: true,
        onboardedAt: '2026-01-01',
        updatedAt: '2026-06-08',
      },
      world,
      skills: [
        { skillKey: LearningSkillKey.SPEAKING, level: 10, updatedAt: '2026-06-08' },
        { skillKey: LearningSkillKey.VOCABULARY, level: 50, updatedAt: '2026-06-08' },
        { skillKey: LearningSkillKey.READING, level: 48, updatedAt: '2026-06-08' },
        { skillKey: LearningSkillKey.LISTENING, level: 45, updatedAt: '2026-06-08' },
        { skillKey: LearningSkillKey.WRITING, level: 40, updatedAt: '2026-06-08' },
        { skillKey: LearningSkillKey.GRAMMAR, level: 42, updatedAt: '2026-06-08' },
      ],
      weaknesses: [
        {
          skillKey: LearningSkillKey.SPEAKING,
          level: 10,
          averageOthers: 45,
          gapPercent: 78,
          priority: 'high',
        },
      ],
      curriculum: {
        worldKey: LearningWorldKey.SURVIVOR,
        units: [],
        completedCount: 2,
        totalCount: 13,
        checkpointCompleted: false,
      },
    })

    assert.equal(report.monthKey, '2026-06')
    assert.ok(report.goals.length > 0)
    assert.ok(report.summary.includes('Survivor'))
  })
})
