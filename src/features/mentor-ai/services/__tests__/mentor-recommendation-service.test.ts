import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey } from '@/types/learning-gps'
import type { MentorAIContext } from '@/types/mentor-ai'

import { MentorRecommendationService } from '../mentor-recommendation-service'

const integrationContext = (): Pick<MentorAIContext, 'learningGps' | 'farm' | 'motivation'> => ({
  learningGps: {
    currentWorld: 'Explorer',
    worldCefr: 'A2',
    worldProgress: 20,
    activeUnitTitle: null,
    curriculumCompleted: 1,
    curriculumTotal: 10,
    prioritySkills: ['reading'],
    weeklyFocus: null,
    path: {
      nextWorldName: 'Professional',
      nextWorldCefr: 'B1',
      worldsUntilAdvanced: 3,
      advancedTargetWorld: 'Global Engineer',
      advancedTargetCefr: 'C1',
      topMission: {
        title: 'Unidade ativa',
        description: 'Continue o currículo',
        emoji: '📚',
        route: '/learning-gps',
        label: 'Abrir GPS',
        skillKey: LearningSkillKey.READING,
      },
      weeklyProjectTitle: null,
      isSpeakingDay: false,
      monthlyGoals: [],
      pathSummary: 'Trilha GPS: Explorer (A2) → 3 mundos até Global Engineer (C1).',
    },
  },
  farm: {
    suggestedActivityKey: 'reading',
    suggestedActivityLabel: 'Leitura',
    suggestedActivityEmoji: '📖',
    suggestedRoute: '/mentor/exercise?gps=1&skill=reading&title=Unidade+ativa&topic=Unidade+ativa',
    minutesToday: 0,
    recentSummary: null,
    coachMessage: 'Faltam ~15 min de leitura no Farm.',
  },
  motivation: {
    dailySparkId: null,
    dailySparkTitle: null,
    dailySparkExcerpt: null,
    openStreak: 0,
    openedToday: false,
    coachMessage: 'Guarde uma frase na Chama Interior.',
  },
})

describe('MentorRecommendationService', () => {
  it('builds summary for multiple high-priority weaknesses', () => {
    const recommendation = MentorRecommendationService.build([
      {
        skillKey: LearningSkillKey.SPEAKING,
        level: 20,
        averageOthers: 70,
        gapPercent: 71,
        priority: 'high',
      },
      {
        skillKey: LearningSkillKey.LISTENING,
        level: 30,
        averageOthers: 68,
        gapPercent: 56,
        priority: 'high',
      },
    ])

    assert.match(recommendation.insightSummary, /conversação/)
    assert.match(recommendation.insightSummary, /escuta/)
    assert.ok(recommendation.actions.length > 0)
  })

  it('falls back to chat action when skills are balanced', () => {
    const recommendation = MentorRecommendationService.build([])
    assert.match(recommendation.insightSummary, /equilibradas/)
    assert.equal(recommendation.actions[0]?.id, 'rec-chat')
  })

  it('prioritizes GPS mission and farm bridge when context is provided', () => {
    const recommendation = MentorRecommendationService.build(
      [
        {
          skillKey: LearningSkillKey.GRAMMAR,
          level: 30,
          averageOthers: 60,
          gapPercent: 50,
          priority: 'high',
        },
      ],
      undefined,
      integrationContext(),
    )

    assert.equal(recommendation.actions[0]?.id, 'rec-gps-mission')
    assert.match(recommendation.summary, /Trilha GPS/)
    assert.match(recommendation.summary, /Farm/)
  })

  it('weaves saved goals into the recommendation summary', () => {
    const recommendation = MentorRecommendationService.build(
      [
        {
          skillKey: LearningSkillKey.SPEAKING,
          level: 20,
          averageOthers: 70,
          gapPercent: 71,
          priority: 'high',
        },
      ],
      {
        goals: ['Conseguir vaga internacional'],
        preferences: [],
        frequentErrors: [],
        recentTopics: [],
      },
    )

    assert.match(recommendation.insightSummary, /Atlas lembra/)
    assert.match(recommendation.insightSummary, /vaga internacional/i)
    assert.match(recommendation.insightSummary, /roleplay|entrevista/i)
    assert.equal(recommendation.actions[0]?.route, '/mentor/roleplay')
  })
})
