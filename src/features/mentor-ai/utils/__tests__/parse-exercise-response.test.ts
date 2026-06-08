import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { parseExerciseResponse } from '../parse-exercise-response'

describe('parseExerciseResponse', () => {
  it('parses valid exercise JSON', () => {
    const raw = JSON.stringify({
      topic: 'past_simple',
      questions: [
        {
          prompt: 'She ___ yesterday.',
          options: ['go', 'went', 'gone', 'going'],
          correctIndex: 1,
          explanation: 'Past Simple de go é went.',
        },
      ],
    })

    const parsed = parseExerciseResponse(raw)

    assert.ok(parsed)
    assert.equal(parsed?.topic, 'past_simple')
    assert.equal(parsed?.title, 'past_simple')
    assert.equal(parsed?.questions.length, 1)
    assert.equal(parsed?.questions[0]?.correctIndex, 1)
  })

  it('parses fenced JSON blocks', () => {
    const raw = [
      'Here is your quiz:',
      '```json',
      '{"topic":"travel","title":"Travel","questions":[{"prompt":"A","options":["a","b"],"correctIndex":0,"explanation":"ok"}]}',
      '```',
    ].join('\n')

    const parsed = parseExerciseResponse(raw)

    assert.ok(parsed)
    assert.equal(parsed?.title, 'Travel')
  })

  it('rejects invalid correctIndex', () => {
    const raw = JSON.stringify({
      topic: 'bad',
      questions: [
        {
          prompt: 'Test?',
          options: ['a', 'b'],
          correctIndex: 5,
          explanation: 'nope',
        },
      ],
    })

    assert.equal(parseExerciseResponse(raw), null)
  })

  it('returns null for empty or unstructured text', () => {
    assert.equal(parseExerciseResponse(''), null)
    assert.equal(parseExerciseResponse('Apenas texto livre.'), null)
  })
})
