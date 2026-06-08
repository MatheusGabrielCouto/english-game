import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildMentorVoiceDisplayText,
  buildMentorVoiceLlmText,
} from '../mentor-voice-speaking-format'

describe('mentor-voice-speaking', () => {
  it('formats display text with Portuguese original', () => {
    const display = buildMentorVoiceDisplayText({
      englishText: 'I want to improve my speaking.',
      originalText: 'Eu quero melhorar minha conversação.',
    })

    assert.match(display, /🎙️ I want to improve my speaking\./)
    assert.match(display, /Eu quero melhorar/)
  })

  it('builds llm payload for Portuguese voice input', () => {
    const llm = buildMentorVoiceLlmText({
      englishText: 'I want to improve my speaking.',
      originalText: 'Eu quero melhorar minha conversação.',
      mode: 'portuguese_to_english',
    })

    assert.match(llm, /student spoke in Portuguese/)
    assert.match(llm, /English: I want to improve my speaking\./)
    assert.match(llm, /Original \(PT\): Eu quero melhorar/)
  })
})
