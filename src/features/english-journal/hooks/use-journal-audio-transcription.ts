import AsyncStorage from '@react-native-async-storage/async-storage'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  DEFAULT_JOURNAL_TRANSCRIPTION_MODE,
  JOURNAL_TRANSCRIPTION_MODE_STORAGE_KEY,
  type JournalTranscriptionMode,
} from '../constants/journal-transcription-mode'
import { JOURNAL_UI } from '../constants/journal-ui'
import {
  processJournalAudioRecording,
  type JournalAudioPipelinePhase,
} from '../services/journal-audio-transcription-pipeline'
import { mergeTranscriptionIntoBody } from '../utils/journal-transcription-body'

type UseJournalAudioTranscriptionOptions = {
  onBodyUpdate: (nextBody: string) => void
  getBody: () => string
}

const phaseLabel = (phase: JournalAudioPipelinePhase | null, mode: JournalTranscriptionMode): string => {
  if (phase === 'translating') return JOURNAL_UI.translatingToEnglish
  if (phase === 'transcribing' && mode === 'portuguese_to_english') {
    return JOURNAL_UI.transcribingPortuguese
  }
  return JOURNAL_UI.transcribing
}

export const useJournalAudioTranscription = ({
  onBodyUpdate,
  getBody,
}: UseJournalAudioTranscriptionOptions) => {
  const [transcriptionMode, setTranscriptionMode] = useState<JournalTranscriptionMode>(
    DEFAULT_JOURNAL_TRANSCRIPTION_MODE,
  )
  const [pipelinePhase, setPipelinePhase] = useState<JournalAudioPipelinePhase | null>(null)
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null)
  const lastTranscribedUriRef = useRef<string | null>(null)

  useEffect(() => {
    void AsyncStorage.getItem(JOURNAL_TRANSCRIPTION_MODE_STORAGE_KEY).then((raw) => {
      if (raw === 'english' || raw === 'portuguese_to_english') {
        setTranscriptionMode(raw)
      }
    })
  }, [])

  const handleTranscriptionModeChange = useCallback((mode: JournalTranscriptionMode) => {
    setTranscriptionMode(mode)
    void AsyncStorage.setItem(JOURNAL_TRANSCRIPTION_MODE_STORAGE_KEY, mode)
  }, [])

  const handleRecordingComplete = useCallback(
    async (uri: string) => {
      if (!uri || uri === lastTranscribedUriRef.current) return

      lastTranscribedUriRef.current = uri
      setPipelinePhase('transcribing')
      setTranscriptionError(null)

      const result = await processJournalAudioRecording(uri, transcriptionMode, setPipelinePhase)

      setPipelinePhase(null)

      if (!result.ok) {
        setTranscriptionError(result.message)
        return
      }

      onBodyUpdate(mergeTranscriptionIntoBody(getBody(), result.text))
    },
    [getBody, onBodyUpdate, transcriptionMode],
  )

  const resetTranscriptionState = useCallback(() => {
    lastTranscribedUriRef.current = null
    setPipelinePhase(null)
    setTranscriptionError(null)
  }, [])

  const isTranscribing = pipelinePhase !== null
  const processingLabel = phaseLabel(pipelinePhase, transcriptionMode)

  return {
    transcriptionMode,
    setTranscriptionMode: handleTranscriptionModeChange,
    isTranscribing,
    processingLabel,
    transcriptionError,
    handleRecordingComplete,
    resetTranscriptionState,
  }
}
