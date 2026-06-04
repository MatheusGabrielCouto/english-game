import { JOURNAL_UI } from '../constants/journal-ui'

const originalPortugueseMarker = `\n\n---\n${JOURNAL_UI.originalPortugueseLabel}`

/** Main English content when the note stores a PT original appendix. */
export const extractEnglishBodyForDisplay = (body: string): string => {
  const markerIndex = body.indexOf(originalPortugueseMarker)
  if (markerIndex === -1) return body.trim()
  return body.slice(0, markerIndex).trim()
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
