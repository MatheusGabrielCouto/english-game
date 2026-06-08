import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey } from '@/types/learning-gps'
import { MentorAIMode } from '@/types/mentor-ai'

import { formatCorrectionResult } from '../../utils/format-correction-result'
import { parseCorrectionResponse } from '../../utils/parse-correction-response'
import { MentorCorrectionEngine } from '../mentor-correction-engine'

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

const DATASET = [
  { input: 'I have 30 years old', correctedIncludes: 'I am 30 years old' },
  { input: 'I am agree with you', correctedIncludes: 'I agree' },
  { input: 'This is more easy', correctedIncludes: 'easier' },
  { input: 'I live here since 2 years', correctedIncludes: 'for 2 years' },
  { input: 'I want that you help me', correctedIncludes: 'I want you to' },
  { input: 'I need more informations', correctedIncludes: 'information' },
  { input: 'Many peoples came', correctedIncludes: 'people' },
  { input: 'He don\'t like it', correctedIncludes: "doesn't" },
  { input: 'She don\'t know', correctedIncludes: "doesn't" },
  { input: 'I didn\'t went home', correctedIncludes: "didn't go" },
  { input: 'I have been to there', correctedIncludes: 'been there' },
  { input: 'It depends of the context', correctedIncludes: 'depends on' },
  { input: 'Can you explain me this?', correctedIncludes: 'explain to me' },
  { input: 'I am thinking to move', correctedIncludes: 'thinking of' },
  { input: 'Let\'s discuss about the plan', correctedIncludes: 'discuss' },
  { input: 'I am boring today', correctedIncludes: 'I am bored' },
  { input: 'I want to loose weight', correctedIncludes: 'lose weight' },
  { input: 'I have a doubt about this', correctedIncludes: 'question' },
  { input: 'How many time do we have?', correctedIncludes: 'how much time' },
  { input: 'I study in the night', correctedIncludes: 'at night' },
  { input: 'On the past we did it', correctedIncludes: 'in the past' },
  { input: 'He is a honest person', correctedIncludes: 'an honest' },
  { input: 'She can to swim', correctedIncludes: 'can swim' },
  { input: 'I will to go tomorrow', correctedIncludes: 'will go' },
  { input: 'We made a decision of hiring', correctedIncludes: 'decision about' },
] as const

describe('MentorCorrectionEngine dataset', () => {
  it('has at least 20 correction rules', () => {
    assert.ok(MentorCorrectionEngine.ruleCount() >= 20)
    assert.equal(DATASET.length, 25)
  })

  for (const sample of DATASET) {
    it(`corrects "${sample.input}"`, () => {
      const result = MentorCorrectionEngine.tryCorrect(sample.input, baseContext)
      assert.ok(result, `expected correction for: ${sample.input}`)
      assert.match(result.corrected, new RegExp(sample.correctedIncludes, 'i'))
      assert.ok(result.explanation.length > 0)
      assert.ok((result.explanationEn ?? '').length > 0, `missing EN explanation for: ${sample.input}`)

      const formatted = formatCorrectionResult(result)
      const parsed = parseCorrectionResponse(formatted, sample.input)

      assert.ok(parsed, `parser failed for: ${sample.input}`)
      assert.equal(parsed?.corrected, result.corrected)
      assert.match(parsed?.explanation ?? '', /./)
      assert.match(parsed?.explanationEn ?? '', /./)
    })
  }
})
