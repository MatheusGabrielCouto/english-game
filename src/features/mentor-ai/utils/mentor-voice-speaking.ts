import type { JournalTranscriptionMode } from '@/features/english-journal/constants/journal-transcription-mode'
import { processJournalAudioRecording } from '@/features/english-journal/services/journal-audio-transcription-pipeline'
import { parseJournalBody } from '@/features/english-journal/utils/journal-transcription-body'

import {
  buildMentorVoiceDisplayText,
  buildMentorVoiceLlmText,
  type MentorVoiceSpeakingMode,
} from './mentor-voice-speaking-format'

export type { MentorVoiceSpeakingMode }
export { buildMentorVoiceDisplayText, buildMentorVoiceLlmText }

export type MentorVoiceSpeakingResult = {
  englishText: string
  originalText: string | null
  mode: MentorVoiceSpeakingMode
  displayText: string
  llmText: string
}

export const MENTOR_VOICE_MODE_STORAGE_KEY = 'mentor_voice_mode_v1'

export const DEFAULT_MENTOR_VOICE_MODE: MentorVoiceSpeakingMode = 'portuguese_to_english'

export const processMentorVoiceRecording = async (
  audioUri: string,
  mode: MentorVoiceSpeakingMode,
  onPhaseChange?: (phase: 'transcribing' | 'translating') => void,
): Promise<
  | { ok: true; result: MentorVoiceSpeakingResult }
  | { ok: false; message: string }
> => {
  const pipeline = await processJournalAudioRecording(audioUri, mode, onPhaseChange)

  if (!pipeline.ok) {
    return { ok: false, message: pipeline.message }
  }

  const parsedBody = parseJournalBody(pipeline.text)
  const englishText = parsedBody.primaryText.trim()
  const originalText =
    mode === 'portuguese_to_english'
      ? pipeline.originalPortuguese?.trim() ?? parsedBody.embeddedPortuguese ?? null
      : null

  if (!englishText) {
    return { ok: false, message: 'Não foi possível entender o áudio. Tente falar mais perto do microfone.' }
  }

  const result: MentorVoiceSpeakingResult = {
    englishText,
    originalText,
    mode,
    displayText: buildMentorVoiceDisplayText({ englishText, originalText }),
    llmText: buildMentorVoiceLlmText({ englishText, originalText, mode }),
  }

  return { ok: true, result }
}
