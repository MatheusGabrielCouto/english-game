import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey } from '@/types/learning-gps'
import { MentorAIMode } from '@/types/mentor-ai'

import { MentorPedagogyEngine } from '../mentor-pedagogy-engine'

const baseContext = {
  generatedAt: '2026-06-08T12:00:00.000Z',
  player: { level: 10, streak: 15, coins: 100, studyPoints: 50 },
  skills: {
    vocabulary: 70,
    reading: 65,
    listening: 40,
    speaking: 25,
    writing: 50,
    grammar: 55,
    weakest: LearningSkillKey.SPEAKING,
    strongest: LearningSkillKey.VOCABULARY,
  },
  learningGps: {
    currentWorld: 'Developer',
    worldCefr: 'B2',
    worldProgress: 42,
    activeUnitTitle: 'Reading docs',
    curriculumCompleted: 3,
    curriculumTotal: 10,
    prioritySkills: ['speaking'],
    weeklyFocus: 'Conversação',
  },
  activity: {
    duelWinRate: 60,
    flashReviewsToday: 5,
    farmMinutesToday: 12,
    routinesDueToday: 2,
    routinesCompletedToday: 1,
  },
  career: { englishScore: 55, activeContract: null },
  memory: { goals: [], preferences: [], frequentErrors: [], recentTopics: [] },
  mode: MentorAIMode.PROFESSOR,
  locale: 'pt-BR' as const,
}

describe('MentorPedagogyEngine', () => {
  it('explains Present Perfect with examples', () => {
    const result = MentorPedagogyEngine.generate(baseContext, 'Explain Present Perfect')
    assert.match(result.response, /Present Perfect/)
    assert.match(result.response, /have\/has/)
    assert.equal(result.topic, 'present_perfect')
  })

  it('corrects age expression', () => {
    const result = MentorPedagogyEngine.generate(
      baseContext,
      'Correct this: "I have 30 years old"',
    )
    assert.match(result.response, /❌/)
    assert.match(result.response, /I am 30 years old/)
    assert.match(result.response, /🇧🇷|💡/)
  })

  it('defines vocabulary and mentions CEFR context in generic fallback', () => {
    const result = MentorPedagogyEngine.generate(baseContext, 'How do I improve faster?')
    assert.match(result.response, /Developer/)
    assert.match(result.response, /B2/)
  })

  it('translates como se fala requests into English', () => {
    const result = MentorPedagogyEngine.generate(
      baseContext,
      'como se fala "hoje eu vou buscar minha esposa"',
    )

    assert.equal(result.topic, 'translation')
    assert.match(result.response, /Em inglês é:/i)
    assert.match(result.response, /I am going to go get my wife today/i)
    assert.match(result.response, /Por quê assim\?/i)
  })
})
