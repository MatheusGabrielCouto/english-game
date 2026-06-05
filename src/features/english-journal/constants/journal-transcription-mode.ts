import { JOURNAL_UI } from './journal-ui'

export type JournalTranscriptionMode = 'english' | 'portuguese' | 'portuguese_to_english'

export const JOURNAL_TRANSCRIPTION_MODE_STORAGE_KEY = 'journal_transcription_mode_v1'

export const DEFAULT_JOURNAL_TRANSCRIPTION_MODE: JournalTranscriptionMode = 'portuguese_to_english'

export const speechLocaleForMode = (mode: JournalTranscriptionMode): 'en-US' | 'pt-BR' =>
  mode === 'english' ? 'en-US' : 'pt-BR'

export const isPortugueseSpeechMode = (mode: JournalTranscriptionMode): boolean =>
  mode === 'portuguese' || mode === 'portuguese_to_english'

export const transcriptionModeHint = (mode: JournalTranscriptionMode): string => {
  switch (mode) {
    case 'english':
      return JOURNAL_UI.transcriptionModeEnglishHint
    case 'portuguese':
      return JOURNAL_UI.transcriptionModePortugueseOnlyHint
    case 'portuguese_to_english':
      return JOURNAL_UI.transcriptionModePortugueseHint
  }
}
