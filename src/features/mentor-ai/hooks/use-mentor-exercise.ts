import { useCallback } from 'react'

import { MentorExerciseService } from '../services/mentor-exercise-service'
import { useMentorExerciseStore } from '../store/mentor-exercise-store'

export const useMentorExercise = () => {
  const topic = useMentorExerciseStore((state) => state.topic)
  const exerciseSet = useMentorExerciseStore((state) => state.exerciseSet)
  const phase = useMentorExerciseStore((state) => state.phase)
  const isGenerating = useMentorExerciseStore((state) => state.isGenerating)
  const streamingText = useMentorExerciseStore((state) => state.streamingText)
  const error = useMentorExerciseStore((state) => state.error)
  const currentIndex = useMentorExerciseStore((state) => state.currentIndex)
  const selectedIndex = useMentorExerciseStore((state) => state.selectedIndex)
  const showExplanation = useMentorExerciseStore((state) => state.showExplanation)
  const correctCount = useMentorExerciseStore((state) => state.correctCount)
  const resultFeedback = useMentorExerciseStore((state) => state.resultFeedback)
  const isGeneratingFeedback = useMentorExerciseStore((state) => state.isGeneratingFeedback)

  const setTopic = useCallback((value: string) => {
    MentorExerciseService.setTopic(value)
  }, [])

  const generateExercise = useCallback(async () => {
    await MentorExerciseService.generateExercise()
  }, [])

  const startSession = useCallback(() => {
    MentorExerciseService.startSession()
  }, [])

  const selectAnswer = useCallback((index: number) => {
    MentorExerciseService.selectAnswer(index)
  }, [])

  const confirmAnswer = useCallback(() => {
    MentorExerciseService.confirmAnswer()
  }, [])

  const nextQuestion = useCallback(() => {
    MentorExerciseService.nextQuestion()
  }, [])

  const backToPreview = useCallback(() => {
    MentorExerciseService.backToPreview()
  }, [])

  const reset = useCallback(() => {
    MentorExerciseService.reset()
  }, [])

  const cancelGeneration = useCallback(() => {
    MentorExerciseService.cancelGeneration()
  }, [])

  return {
    topic,
    exerciseSet,
    phase,
    isGenerating,
    streamingText,
    error,
    currentIndex,
    selectedIndex,
    showExplanation,
    correctCount,
    resultFeedback,
    isGeneratingFeedback,
    setTopic,
    generateExercise,
    startSession,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    backToPreview,
    reset,
    cancelGeneration,
  }
}
