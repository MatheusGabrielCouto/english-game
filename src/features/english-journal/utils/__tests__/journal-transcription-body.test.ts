import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
    extractEnglishBodyForDisplay,
    formatTranslatedNoteBody,
    mergeTranscriptionIntoBody,
} from '../journal-transcription-body'

describe('extractEnglishBodyForDisplay', () => {
  it('strips portuguese appendix from stored body', () => {
    const body = formatTranslatedNoteBody('Hello world', 'Olá mundo')
    assert.equal(extractEnglishBodyForDisplay(body), 'Hello world')
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
