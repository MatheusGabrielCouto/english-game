import { JOURNAL_UI } from '../constants/journal-ui'

const originalPortugueseMarker = `\n\n---\n${JOURNAL_UI.originalPortugueseLabel}`
const portugueseOnlyMarker = `\n\n---\n${JOURNAL_UI.portugueseOnlyLabel}`

const PORTUGUESE_CHAR_PATTERN = /[ãõâêôáéíóúçÃÕÂÊÔÁÉÍÓÚÇ]/
const PORTUGUESE_WORD_PATTERN =
  /\b(não|nao|você|voce|também|tambem|porque|então|entao|está|esta|estou|muito|já|ja|só|so|pra|que|com|para|isso|essa|esse|aqui|onde|como|quando|ainda|sempre|nunca|por|mas|mais|menos|todo|toda|todos|todas)\b/gi
const ENGLISH_WORD_PATTERN =
  /\b(the|and|with|that|this|have|from|they|would|there|their|about|which|when|what|you|your|was|were|been|being)\b/i

export type JournalBodyLanguage = 'english' | 'portuguese'

export type JournalBodyParts = {
  primaryText: string
  primaryLanguage: JournalBodyLanguage
  embeddedPortuguese?: string
}

const looksPortuguese = (text: string): boolean => {
  if (ENGLISH_WORD_PATTERN.test(text)) return false
  if (PORTUGUESE_CHAR_PATTERN.test(text)) return true
  const matches = text.match(PORTUGUESE_WORD_PATTERN)
  return (matches?.length ?? 0) >= 3
}

export const parseJournalBody = (body: string): JournalBodyParts => {
  const trimmed = body.trim()
  if (!trimmed) {
    return { primaryText: '', primaryLanguage: 'english' }
  }

  const ptAppendixIndex = trimmed.indexOf(originalPortugueseMarker)
  if (ptAppendixIndex !== -1) {
    const english = trimmed.slice(0, ptAppendixIndex).trim()
    const embeddedPortuguese = trimmed.slice(ptAppendixIndex + originalPortugueseMarker.length).trim()
    return {
      primaryText: english,
      primaryLanguage: 'english',
      embeddedPortuguese: embeddedPortuguese || undefined,
    }
  }

  const ptOnlyIndex = trimmed.indexOf(portugueseOnlyMarker)
  if (ptOnlyIndex !== -1) {
    return {
      primaryText: trimmed.slice(0, ptOnlyIndex).trim(),
      primaryLanguage: 'portuguese',
    }
  }

  const primaryLanguage = looksPortuguese(trimmed) ? 'portuguese' : 'english'
  return { primaryText: trimmed, primaryLanguage }
}

/** Primary note content for lists and detail (strips translation appendices). */
export const extractEnglishBodyForDisplay = (body: string): string => parseJournalBody(body).primaryText

/** Portuguese-only note body with a hidden marker for language detection. */
export const formatPortugueseOnlyNoteBody = (portuguese: string): string => {
  const pt = portuguese.trim()
  if (!pt) return ''
  return `${pt}${portugueseOnlyMarker}`
}

/** English note body with optional Portuguese source preserved for reference. */
export const formatTranslatedNoteBody = (english: string, originalPortuguese?: string): string => {
  const en = english.trim()
  if (!en) return ''

  const pt = originalPortuguese?.trim()
  if (!pt || pt === en) return en

  return `${en}\n\n---\n${JOURNAL_UI.originalPortugueseLabel}\n${pt}`
}

/** Applies speech-to-text into the note body without overwriting user text. */
export const mergeTranscriptionIntoBody = (currentBody: string, transcription: string): string => {
  const next = transcription.trim()
  if (!next) return currentBody

  const existing = currentBody.trim()
  if (!existing) return next

  if (existing.includes(next)) return existing

  return `${existing}\n\n${next}`
}
