import type { JournalTranscriptionMode } from '../constants/journal-transcription-mode'
import { speechLocaleForMode } from '../constants/journal-transcription-mode'
import { JOURNAL_UI } from '../constants/journal-ui'
import { formatPortugueseOnlyNoteBody, formatTranslatedNoteBody } from '../utils/journal-transcription-body'
import { transcribeJournalAudio } from './journal-audio-transcription'
import { translatePortugueseToEnglish } from './journal-text-translation'

export type JournalAudioPipelinePhase = 'transcribing' | 'translating'

export type JournalAudioPipelineResult =
  | { ok: true; text: string; originalPortuguese?: string }
  | { ok: false; message: string }

export const processJournalAudioRecording = async (
  audioUri: string,
  mode: JournalTranscriptionMode,
  onPhaseChange?: (phase: JournalAudioPipelinePhase) => void,
): Promise<JournalAudioPipelineResult> => {
  onPhaseChange?.('transcribing')

  const transcription = await transcribeJournalAudio(audioUri, speechLocaleForMode(mode))
  if (!transcription.ok) {
    if (transcription.reason === 'empty') {
      return { ok: false, message: transcription.message }
    }
    return { ok: false, message: transcription.message }
  }

  if (mode === 'english') {
    return { ok: true, text: transcription.text }
  }

  if (mode === 'portuguese') {
    return { ok: true, text: formatPortugueseOnlyNoteBody(transcription.text) }
  }

  onPhaseChange?.('translating')

  const translation = await translatePortugueseToEnglish(transcription.text)
  if (!translation.ok) {
    return {
      ok: false,
      message: translation.message || JOURNAL_UI.translationFailed,
    }
  }

  return {
    ok: true,
    text: formatTranslatedNoteBody(translation.text, transcription.text),
    originalPortuguese: transcription.text,
  }
}
