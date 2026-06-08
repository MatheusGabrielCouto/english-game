import { useCallback } from 'react'

import { MentorCorrectionService } from '../services/mentor-correction-service'
import { useMentorCorrectionStore } from '../store/mentor-correction-store'

export const useMentorCorrection = () => {
  const input = useMentorCorrectionStore((state) => state.input)
  const result = useMentorCorrectionStore((state) => state.result)
  const isGenerating = useMentorCorrectionStore((state) => state.isGenerating)
  const streamingText = useMentorCorrectionStore((state) => state.streamingText)
  const error = useMentorCorrectionStore((state) => state.error)
  const savedErrorId = useMentorCorrectionStore((state) => state.savedErrorId)

  const setInput = useCallback((value: string) => {
    MentorCorrectionService.setInput(value)
  }, [])

  const correctSentence = useCallback(async () => {
    await MentorCorrectionService.correctSentence()
  }, [])

  const reset = useCallback(() => {
    MentorCorrectionService.reset()
  }, [])

  const cancelGeneration = useCallback(() => {
    MentorCorrectionService.cancelGeneration()
  }, [])

  return {
    input,
    result,
    isGenerating,
    streamingText,
    error,
    savedErrorId,
    setInput,
    correctSentence,
    reset,
    cancelGeneration,
  }
}
