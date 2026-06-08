import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey, LearningWorldKey } from '@/types/learning-gps'

import { buildMentorGpsPath } from '../build-mentor-gps-path'

const worlds = [
  {
    key: LearningWorldKey.SURVIVOR,
    name: 'Survivor',
    emoji: '🏕️',
    cefrLevel: 'A1',
    sortOrder: 1,
  },
  {
    key: LearningWorldKey.EXPLORER,
    name: 'Explorer',
    emoji: '🧭',
    cefrLevel: 'A2',
    sortOrder: 2,
  },
  {
    key: LearningWorldKey.PROFESSIONAL,
    name: 'Professional',
    emoji: '💼',
    cefrLevel: 'B1',
    sortOrder: 3,
  },
  {
    key: LearningWorldKey.DEVELOPER,
    name: 'Developer',
    emoji: '💻',
    cefrLevel: 'B2',
    sortOrder: 4,
  },
  {
    key: LearningWorldKey.GLOBAL_ENGINEER,
    name: 'Global Engineer',
    emoji: '🌍',
    cefrLevel: 'C1',
    sortOrder: 5,
  },
  {
    key: LearningWorldKey.LEGEND,
    name: 'Legend',
    emoji: '👑',
    cefrLevel: 'C2',
    sortOrder: 6,
  },
]

describe('buildMentorGpsPath', () => {
  it('counts worlds until advanced milestone from developer', () => {
    const path = buildMentorGpsPath({
      world: worlds[3],
      worlds,
      intelligence: null,
    })

    assert.equal(path.worldsUntilAdvanced, 1)
    assert.equal(path.advancedTargetWorld, 'Global Engineer')
    assert.equal(path.nextWorldName, 'Global Engineer')
    assert.match(path.pathSummary, /Trilha GPS/)
    assert.match(path.pathSummary, /Developer/)
  })

  it('includes top GPS mission when intelligence is present', () => {
    const path = buildMentorGpsPath({
      world: worlds[1],
      worlds,
      intelligence: {
        weaknesses: [],
        prioritySkillKeys: [LearningSkillKey.SPEAKING],
        missions: [
          {
            id: 'm1',
            skillKey: LearningSkillKey.SPEAKING,
            title: 'Reforçar conversação',
            description: 'Gap alto em speaking',
            emoji: '🗣️',
            practiceRoute: '/farm',
            practiceLabel: 'Conversar no Farm',
            source: 'weakness',
            priority: 1,
          },
        ],
        weeklyPlan: {
          weekKey: '2026-W23',
          days: [
            {
              weekday: 1,
              label: 'Seg',
              focusSkills: [LearningSkillKey.SPEAKING],
              isProjectDay: false,
              isReviewDay: false,
              isSpeakingDay: true,
              isToday: true,
            },
          ],
          projectTitle: 'Projeto semanal',
          projectDescription: '',
          projectEmoji: '📦',
        },
        monthlyReport: {
          monthKey: '2026-06',
          generatedAt: new Date().toISOString(),
          worldName: 'Explorer',
          worldCefr: 'A2',
          worldProgress: 40,
          skills: [],
          weaknesses: [],
          goals: ['Fluência em reuniões'],
          summary: 'Continue firme',
          curriculumCompleted: 2,
          curriculumTotal: 10,
        },
      },
    })

    assert.equal(path.topMission?.title, 'Reforçar conversação')
    assert.equal(path.isSpeakingDay, true)
    assert.deepEqual(path.monthlyGoals, ['Fluência em reuniões'])
    assert.match(path.pathSummary, /Missão de hoje/)
  })
})
