import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey } from '@/types/learning-gps'

import { resolveSkillExtremes } from '../resolve-skill-extremes'

describe('resolveSkillExtremes', () => {
  it('returns defaults when skills are empty', () => {
    assert.deepEqual(resolveSkillExtremes([]), {
      weakest: LearningSkillKey.SPEAKING,
      strongest: LearningSkillKey.VOCABULARY,
    })
  })

  it('picks lowest and highest skill levels', () => {
    const result = resolveSkillExtremes([
      { skillKey: LearningSkillKey.VOCABULARY, level: 80, updatedAt: '2026-01-01' },
      { skillKey: LearningSkillKey.SPEAKING, level: 20, updatedAt: '2026-01-01' },
      { skillKey: LearningSkillKey.GRAMMAR, level: 55, updatedAt: '2026-01-01' },
    ])

    assert.equal(result.weakest, LearningSkillKey.SPEAKING)
    assert.equal(result.strongest, LearningSkillKey.VOCABULARY)
  })
})
