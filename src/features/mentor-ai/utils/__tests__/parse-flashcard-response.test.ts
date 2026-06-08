import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseFlashcardResponse } from '../parse-flashcard-response'

describe('parseFlashcardResponse', () => {
  it('parses valid flashcard JSON', () => {
    const raw = JSON.stringify({
      topic: 'travel',
      cards: [
        {
          front: 'boarding pass',
          back: 'cartão de embarque',
          example: 'Show your boarding pass.',
        },
      ],
    })

    const parsed = parseFlashcardResponse(raw)

    assert.ok(parsed)
    assert.equal(parsed?.topic, 'travel')
    assert.equal(parsed?.cards.length, 1)
    assert.equal(parsed?.cards[0]?.front, 'boarding pass')
  })

  it('parses fenced JSON blocks', () => {
    const raw = [
      '```',
      '{"topic":"tech","title":"Tech words","cards":[{"front":"deploy","back":"implantar"}]}',
      '```',
    ].join('\n')

    const parsed = parseFlashcardResponse(raw)

    assert.ok(parsed)
    assert.equal(parsed?.title, 'Tech words')
  })

  it('returns null for invalid payloads', () => {
    assert.equal(parseFlashcardResponse(''), null)
    assert.equal(parseFlashcardResponse('{"cards":[]}'), null)
  })
})
