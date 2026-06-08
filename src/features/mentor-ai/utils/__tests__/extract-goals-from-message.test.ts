import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { extractGoalsFromMessage } from '../extract-goals-from-message'

describe('extractGoalsFromMessage', () => {
  it('extracts career goals in Portuguese', () => {
    const goals = extractGoalsFromMessage('Quero trabalhar no exterior em uma empresa de tech')

    assert.equal(goals.length, 1)
    assert.match(goals[0], /trabalhar no exterior/i)
  })

  it('extracts explicit objective phrases', () => {
    const goals = extractGoalsFromMessage('Minha meta é passar em entrevista frontend')

    assert.equal(goals.length, 1)
    assert.match(goals[0], /passar em entrevista frontend/i)
  })

  it('extracts English goals', () => {
    const goals = extractGoalsFromMessage('My goal is to get a remote job abroad')

    assert.equal(goals.length, 1)
    assert.match(goals[0], /remote job abroad/i)
  })

  it('ignores pedagogical questions', () => {
    const goals = extractGoalsFromMessage('Quero saber o que é Present Perfect')

    assert.equal(goals.length, 0)
  })

  it('ignores explain requests', () => {
    const goals = extractGoalsFromMessage('Explain Present Perfect to me')

    assert.equal(goals.length, 0)
  })

  it('ignores como se fala questions', () => {
    const goals = extractGoalsFromMessage('Como se fala "hoje eu vou buscar minha esposa"?')

    assert.equal(goals.length, 0)
  })

  it('extracts pretendo and sonho em', () => {
    const goals = extractGoalsFromMessage('Sonho em morar no Canadá e trabalhar com React')

    assert.equal(goals.length, 1)
    assert.match(goals[0], /morar no Canadá/i)
  })

  it('deduplicates repeated goals in one message', () => {
    const goals = extractGoalsFromMessage(
      'Quero conseguir vaga internacional. Quero conseguir vaga internacional.',
    )

    assert.equal(goals.length, 1)
  })
})
