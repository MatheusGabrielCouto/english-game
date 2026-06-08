import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    buildHeuristicRoleplayFeedback,
    parseRoleplayFeedback,
} from '../parse-roleplay-feedback'

describe('parseRoleplayFeedback', () => {
  it('parses valid feedback JSON', () => {
    const raw = JSON.stringify({
      clarity: { score: 4, note: 'Boa estrutura.' },
      vocabulary: { score: 3, note: 'Amplie termos do cenário.' },
      grammar: { score: 3, note: 'Revise tempos verbais.' },
      technical: { score: 4, note: 'Bons exemplos técnicos.' },
      summary: 'Boa sessão.',
      nextSteps: ['Pratique em voz alta', 'Anote 5 termos novos'],
    })

    const parsed = parseRoleplayFeedback(raw)

    assert.ok(parsed)
    assert.equal(parsed?.clarity.score, 4)
    assert.equal(parsed?.nextSteps.length, 2)
  })

  it('returns null for invalid payloads', () => {
    assert.equal(parseRoleplayFeedback(''), null)
    assert.equal(parseRoleplayFeedback('{"summary":"only"}'), null)
  })
})

describe('buildHeuristicRoleplayFeedback', () => {
  it('includes technical competency for interviews', () => {
    const feedback = buildHeuristicRoleplayFeedback(6, true)
    assert.ok(feedback.technical)
  })

  it('omits technical competency for conversation', () => {
    const feedback = buildHeuristicRoleplayFeedback(3, false)
    assert.equal(feedback.technical, undefined)
  })
})
