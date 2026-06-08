import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { FarmActivityType } from '@/types/farm'
import { LearningSkillKey } from '@/types/learning-gps'

import { buildMentorFarmBridge } from '../build-mentor-farm-bridge'

describe('buildMentorFarmBridge', () => {
  it('routes speaking weakness to Atlas roleplay on speaking day', () => {
    const bridge = buildMentorFarmBridge({
      weakestSkill: LearningSkillKey.SPEAKING,
      farmMinutesToday: 5,
      recentSessions: [],
      dateKey: '2026-06-08',
      isSpeakingDay: true,
    })

    assert.match(bridge.suggestedRoute, /\/mentor\/roleplay/)
    assert.match(bridge.coachMessage, /roleplay|Atlas/i)
  })

  it('suggests mentor exercise for grammar weakness', () => {
    const bridge = buildMentorFarmBridge({
      weakestSkill: LearningSkillKey.GRAMMAR,
      farmMinutesToday: 0,
      recentSessions: [
        {
          id: 1,
          activityType: FarmActivityType.EXERCISE,
          amount: 10,
          studyPointsEarned: 20,
          coinsEarned: 10,
          recordedAt: '2026-06-08T10:00:00.000Z',
        },
      ],
      dateKey: '2026-06-08',
      isSpeakingDay: false,
    })

    assert.match(bridge.suggestedRoute, /\/mentor\/exercise/)
    assert.ok(bridge.recentSummary?.includes('sessão'))
  })
})
