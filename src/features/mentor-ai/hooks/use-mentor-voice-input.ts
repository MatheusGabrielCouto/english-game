import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useState } from 'react'

import { isJournalAudioTranscriptionAvailable } from '@/features/english-journal/services/journal-audio-transcription'

import {
  DEFAULT_MENTOR_VOICE_MODE,
  MENTOR_VOICE_MODE_STORAGE_KEY,
  type MentorVoiceSpeakingMode,
} from '../utils/mentor-voice-speaking'

export const useMentorVoicePreferences = () => {
  const [voiceMode, setVoiceModeState] = useState<MentorVoiceSpeakingMode>(DEFAULT_MENTOR_VOICE_MODE)

  useEffect(() => {
    void AsyncStorage.getItem(MENTOR_VOICE_MODE_STORAGE_KEY).then((raw) => {
      if (raw === 'english' || raw === 'portuguese_to_english') {
        setVoiceModeState(raw)
      }
    })
  }, [])

  const setVoiceMode = useCallback((mode: MentorVoiceSpeakingMode) => {
    setVoiceModeState(mode)
    void AsyncStorage.setItem(MENTOR_VOICE_MODE_STORAGE_KEY, mode)
  }, [])

  return {
    voiceMode,
    setVoiceMode,
    isVoiceAvailable: isJournalAudioTranscriptionAvailable(),
  }
}
