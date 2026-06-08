import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { LearningSkillKey, LearningUnitKind } from '@/types/learning-gps'

import {
    buildGpsMentorPracticeHref,
    resolveGpsMentorPracticeLabel,
} from '../resolve-gps-mentor-practice'

describe('resolve-gps-mentor-practice', () => {
  it('routes speaking units to mentor roleplay', () => {
    const href = buildGpsMentorPracticeHref({
      skillKey: LearningSkillKey.SPEAKING,
      title: 'Conversação básica',
      unitKey: 'survivor_speaking',
      unitKind: LearningUnitKind.SPEAKING,
    })

    assert.match(String(href), /\/mentor\/roleplay/)
    assert.match(String(href), /gps=1/)
    assert.match(String(href), /survivor_speaking/)
  })

  it('routes vocabulary units to mentor exercise flashcards', () => {
    const href = buildGpsMentorPracticeHref({
      skillKey: LearningSkillKey.VOCABULARY,
      title: 'Números e cores',
      unitKey: 'survivor_numbers_colors',
      unitKind: LearningUnitKind.VOCABULARY,
    })

    assert.match(String(href), /\/mentor\/exercise/)
    assert.match(String(href), /tab=flashcards/)
    assert.equal(
      resolveGpsMentorPracticeLabel({
        skillKey: LearningSkillKey.VOCABULARY,
        title: 'Números e cores',
      }),
      'Vocabulário com o Atlas',
    )
  })
})
