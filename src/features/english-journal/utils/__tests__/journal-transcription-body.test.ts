import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    extractEnglishBodyForDisplay,
    formatPortugueseOnlyNoteBody,
    formatTranslatedNoteBody,
    mergeTranscriptionIntoBody,
    parseJournalBody,
} from '../journal-transcription-body'

describe('extractEnglishBodyForDisplay', () => {
  it('strips portuguese appendix from stored body', () => {
    const body = formatTranslatedNoteBody('Hello world', 'Olá mundo')
    assert.equal(extractEnglishBodyForDisplay(body), 'Hello world')
  })
})

describe('parseJournalBody', () => {
  it('detects portuguese-only notes with marker', () => {
    const body = formatPortugueseOnlyNoteBody('Hoje eu estudei verbos')
    assert.deepEqual(parseJournalBody(body), {
      primaryText: 'Hoje eu estudei verbos',
      primaryLanguage: 'portuguese',
    })
  })

  it('detects english notes with portuguese appendix', () => {
    const body = formatTranslatedNoteBody('Today I studied verbs', 'Hoje eu estudei verbos')
    assert.deepEqual(parseJournalBody(body), {
      primaryText: 'Today I studied verbs',
      primaryLanguage: 'english',
      embeddedPortuguese: 'Hoje eu estudei verbos',
    })
  })

  it('heuristically detects unmarked portuguese text', () => {
    assert.equal(
      parseJournalBody('Hoje eu estudei muito e não parei').primaryLanguage,
      'portuguese',
    )
  })
})

describe('formatPortugueseOnlyNoteBody', () => {
  it('appends portuguese-only marker', () => {
    const body = formatPortugueseOnlyNoteBody('Hoje eu estudei verbos')
    assert.match(body, /Nota em português/)
  })
})

describe('formatTranslatedNoteBody', () => {
  it('keeps english only when no portuguese source', () => {
    assert.equal(formatTranslatedNoteBody('Hello world'), 'Hello world')
  })

  it('appends portuguese original section', () => {
    const body = formatTranslatedNoteBody('Hello world', 'Olá mundo')
    assert.match(body, /^Hello world/)
    assert.match(body, /Original \(PT\)/)
    assert.match(body, /Olá mundo/)
  })
})

describe('mergeTranscriptionIntoBody', () => {
  it('fills empty body with transcription', () => {
    assert.equal(mergeTranscriptionIntoBody('', 'Hello world'), 'Hello world')
  })

  it('appends when body already has text', () => {
    assert.equal(
      mergeTranscriptionIntoBody('My notes', 'Hello world'),
      'My notes\n\nHello world',
    )
  })

  it('does not duplicate identical transcription', () => {
    assert.equal(mergeTranscriptionIntoBody('Hello world', 'Hello world'), 'Hello world')
  })
})
