import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseCorrectionResponse } from '../parse-correction-response'

describe('parseCorrectionResponse', () => {
  it('parses the canonical ❌✅💡 blocks', () => {
    const parsed = parseCorrectionResponse(
      [
        '❌ I have 30 years old',
        '✅ I am 30 years old',
        '💡 Em inglês usamos to be para idade.',
      ].join('\n'),
      'I have 30 years old',
    )

    assert.ok(parsed)
    assert.equal(parsed?.original, 'I have 30 years old')
    assert.equal(parsed?.corrected, 'I am 30 years old')
    assert.match(parsed?.explanation ?? '', /to be/)
  })

  it('strips markdown from explanation', () => {
    const parsed = parseCorrectionResponse(
      '❌ I am agree\n✅ I agree\n💡 **Agree** já é verbo.',
      'I am agree',
    )

    assert.ok(parsed)
    assert.equal(parsed?.explanation, 'Agree já é verbo.')
  })

  it('returns null when blocks are missing', () => {
    assert.equal(parseCorrectionResponse('Apenas texto livre.', 'foo'), null)
  })

  it('parses lenient Wrong/Correct/Tip labels', () => {
    const parsed = parseCorrectionResponse(
      [
        'Wrong: I have 30 years old',
        'Correct: I am 30 years old',
        'Tip: Em inglês usamos to be para idade.',
      ].join('\n'),
      'I have 30 years old',
    )

    assert.ok(parsed)
    assert.equal(parsed?.corrected, 'I am 30 years old')
  })

  it('parses arrow format', () => {
    const parsed = parseCorrectionResponse(
      'I have 30 years old → I am 30 years old\nUse to be for age.',
      'I have 30 years old',
    )

    assert.ok(parsed)
    assert.equal(parsed?.corrected, 'I am 30 years old')
  })

  it('parses bilingual 🇬🇧/🇧🇷 explanations', () => {
    const parsed = parseCorrectionResponse(
      [
        '❌ I have 30 years old',
        '✅ I am 30 years old',
        '🇬🇧 In English we use to be for age.',
        '🇧🇷 Em inglês usamos to be para idade.',
      ].join('\n'),
      'I have 30 years old',
    )

    assert.ok(parsed)
    assert.equal(parsed?.corrected, 'I am 30 years old')
    assert.match(parsed?.explanationEn ?? '', /to be for age/)
    assert.match(parsed?.explanation ?? '', /to be para idade/)
  })

  it('parses three plain lines as heuristic', () => {
    const parsed = parseCorrectionResponse(
      ['I have 30 years old', 'I am 30 years old', 'Use to be for age in Portuguese.'].join('\n'),
      'I have 30 years old',
    )

    assert.ok(parsed)
    assert.equal(parsed?.corrected, 'I am 30 years old')
  })
})
