import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    extractTranslationPhrase,
    isTranslationRequest,
    MentorTranslationEngine,
} from '../mentor-translation-engine'

describe('MentorTranslationEngine', () => {
  it('detects translation requests in Portuguese', () => {
    assert.equal(isTranslationRequest('como se fala "hoje eu vou buscar minha esposa"'), true)
    assert.equal(isTranslationRequest('Como se fala "hoje eu vou buscar minha esposa"?'), true)
    assert.equal(isTranslationRequest('Explain Present Perfect'), false)
  })

  it('extracts phrase from como se fala with question mark', () => {
    const phrase = extractTranslationPhrase('Como se fala "hoje eu vou buscar minha esposa"?')
    assert.equal(phrase, 'hoje eu vou buscar minha esposa')
  })

  it('responds didactically with Em inglês é and Por quê assim', () => {
    const response = MentorTranslationEngine.tryTranslate(
      'Como se fala "hoje eu vou buscar minha esposa"?',
    )

    assert.ok(response)
    assert.match(response ?? '', /Em inglês é:/i)
    assert.match(response ?? '', /I am going to go get my wife today/i)
    assert.match(response ?? '', /Por quê assim\?/i)
    assert.match(response ?? '', /going to/i)
    assert.match(response ?? '', /pick up/i)
    assert.match(response ?? '', /Pratique:/i)
  })
})
