export type JournalTranscriptionMode = 'english' | 'portuguese_to_english'

export const JOURNAL_TRANSCRIPTION_MODE_STORAGE_KEY = 'journal_transcription_mode_v1'

export const DEFAULT_JOURNAL_TRANSCRIPTION_MODE: JournalTranscriptionMode = 'portuguese_to_english'

export const speechLocaleForMode = (mode: JournalTranscriptionMode): 'en-US' | 'pt-BR' =>
  mode === 'portuguese_to_english' ? 'pt-BR' : 'en-US'
