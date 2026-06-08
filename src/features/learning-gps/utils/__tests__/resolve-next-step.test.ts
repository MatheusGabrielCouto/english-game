import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey } from '@/types/learning-gps'

import { countTodayPending, resolveNextStep } from '@/features/learning-gps/utils/resolve-next-step'

describe('resolve-next-step', () => {
  it('prioritizes top mission as next step', () => {
    const step = resolveNextStep({
      intelligence: {
        weaknesses: [],
        prioritySkillKeys: [],
        missions: [
          {
            id: 'm1',
            skillKey: LearningSkillKey.SPEAKING,
            title: 'Reforçar Conversação',
            description: 'Gap',
            emoji: '🗣️',
            practiceRoute: '/farm',
            practiceLabel: 'Praticar',
            source: 'weakness',
            priority: 1,
          },
        ],
        weeklyPlan: {
          weekKey: '2026-W23',
          days: [],
          projectTitle: 'P',
          projectDescription: 'D',
          projectEmoji: '✍️',
        },
        monthlyReport: {
          monthKey: '2026-06',
          generatedAt: '2026-06-01',
          worldName: 'Survivor',
          worldCefr: 'A1',
          worldProgress: 0,
          skills: [],
          weaknesses: [],
          goals: [],
          summary: 'S',
          curriculumCompleted: 0,
          curriculumTotal: 0,
        },
      },
      curriculum: null,
      todayBlocks: [],
    })

    assert.equal(step.kind, 'mission')
    if (step.kind === 'mission') assert.equal(step.title, 'Reforçar Conversação')
  })

  it('counts pending blocks and routines', () => {
    const pending = countTodayPending({
      todayBlocks: [
        {
          id: '1',
          skillKey: LearningSkillKey.VOCABULARY,
          minutes: 10,
          label: 'V',
          emoji: '📝',
          progressMinutes: 0,
          completed: false,
        },
        {
          id: '2',
          skillKey: LearningSkillKey.READING,
          minutes: 10,
          label: 'R',
          emoji: '📖',
          progressMinutes: 10,
          completed: true,
        },
      ],
      completedRoutinesCount: 0,
      totalRoutinesCount: 2,
    })

    assert.equal(pending, 3)
  })
})
