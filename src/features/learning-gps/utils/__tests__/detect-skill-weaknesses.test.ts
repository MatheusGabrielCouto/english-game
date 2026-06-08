import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey } from '@/types/learning-gps'

import {
    detectSkillWeaknesses,
    getPrioritySkillKeys,
} from '@/features/learning-gps/utils/detect-skill-weaknesses'

const skills = [
  { skillKey: LearningSkillKey.VOCABULARY, level: 40, updatedAt: '2026-01-01' },
  { skillKey: LearningSkillKey.READING, level: 60, updatedAt: '2026-01-01' },
  { skillKey: LearningSkillKey.LISTENING, level: 55, updatedAt: '2026-01-01' },
  { skillKey: LearningSkillKey.SPEAKING, level: 20, updatedAt: '2026-01-01' },
  { skillKey: LearningSkillKey.WRITING, level: 50, updatedAt: '2026-01-01' },
  { skillKey: LearningSkillKey.GRAMMAR, level: 58, updatedAt: '2026-01-01' },
]

describe('detect-skill-weaknesses', () => {
  it('flags skills below 70% of peer average as high priority', () => {
    const weaknesses = detectSkillWeaknesses(skills)
    const speaking = weaknesses.find((entry) => entry.skillKey === LearningSkillKey.SPEAKING)
    assert.equal(speaking?.priority, 'high')
  })

  it('returns empty list when all skills are zero', () => {
    const empty = detectSkillWeaknesses(
      skills.map((skill) => ({ ...skill, level: 0 })),
    )
    assert.deepEqual(empty, [])
  })

  it('extracts high-priority skill keys', () => {
    const weaknesses = detectSkillWeaknesses(skills)
    const keys = getPrioritySkillKeys(weaknesses)
    assert.ok(keys.includes(LearningSkillKey.SPEAKING))
  })
})
