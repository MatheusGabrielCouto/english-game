import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey } from '@/types/learning-gps'

import { buildMentorGreeting } from '../build-greeting'

describe('buildMentorGreeting', () => {
  it('uses a short headline for long streaks', () => {
    const greeting = buildMentorGreeting({
      streak: 42,
      weakestSkill: LearningSkillKey.SPEAKING,
      worldName: 'Developer',
      worldCefr: 'B2',
    })

    assert.equal(greeting.headline, '42 dias de sequência')
    assert.match(greeting.subtitle, /GPS Developer/)
    assert.match(greeting.subtitle, /conversação/)
  })

  it('weaves GPS path, mission and motivation into subtitle', () => {
    const greeting = buildMentorGreeting({
      streak: 3,
      weakestSkill: LearningSkillKey.LISTENING,
      worldName: 'Explorer',
      worldCefr: 'A2',
      worldsUntilAdvanced: 3,
      advancedTargetWorld: 'Global Engineer',
      topMissionTitle: 'Reforçar escuta',
      motivation: {
        dailySparkTitle: 'Foco total',
        openedToday: false,
        openStreak: 2,
      },
    })

    assert.equal(greeting.headline, 'Foco em escuta')
    assert.match(greeting.subtitle, /GPS Explorer \(A2\)/)
    assert.match(greeting.subtitle, /missão: Reforçar escuta/)
    assert.match(greeting.subtitle, /3 mundos → Global Engineer/)
    assert.match(greeting.subtitle, /chama: Foco total/)
  })
})
