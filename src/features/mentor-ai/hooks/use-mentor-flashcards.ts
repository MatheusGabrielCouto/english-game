import { useCallback } from 'react'

import { MentorFlashcardService } from '../services/mentor-flashcard-service'
import { useMentorFlashcardStore } from '../store/mentor-flashcard-store'

export const useMentorFlashcards = () => {
  const topic = useMentorFlashcardStore((state) => state.topic)
  const cardCount = useMentorFlashcardStore((state) => state.cardCount)
  const flashcardSet = useMentorFlashcardStore((state) => state.flashcardSet)
  const phase = useMentorFlashcardStore((state) => state.phase)
  const currentIndex = useMentorFlashcardStore((state) => state.currentIndex)
  const isGenerating = useMentorFlashcardStore((state) => state.isGenerating)
  const streamingText = useMentorFlashcardStore((state) => state.streamingText)
  const error = useMentorFlashcardStore((state) => state.error)
  const savedDeckId = useMentorFlashcardStore((state) => state.savedDeckId)
  const savedCount = useMentorFlashcardStore((state) => state.savedCount)

  const setTopic = useCallback((value: string) => {
    MentorFlashcardService.setTopic(value)
  }, [])

  const setCardCount = useCallback((value: number) => {
    MentorFlashcardService.setCardCount(value)
  }, [])

  const generateFlashcards = useCallback(async () => {
    await MentorFlashcardService.generateFlashcards()
  }, [])

  const exportToDeck = useCallback(async () => {
    return MentorFlashcardService.exportToDeck()
  }, [])

  const reset = useCallback(() => {
    MentorFlashcardService.reset()
  }, [])

  const cancelGeneration = useCallback(() => {
    MentorFlashcardService.cancelGeneration()
  }, [])

  const startStudy = useCallback((index = 0) => {
    MentorFlashcardService.startStudy(index)
  }, [])

  const openCardAt = useCallback((index: number) => {
    MentorFlashcardService.openCardAt(index)
  }, [])

  const nextCard = useCallback(() => {
    MentorFlashcardService.nextCard()
  }, [])

  const prevCard = useCallback(() => {
    MentorFlashcardService.prevCard()
  }, [])

  const exitStudy = useCallback(() => {
    MentorFlashcardService.exitStudy()
  }, [])

  return {
    topic,
    cardCount,
    flashcardSet,
    phase,
    currentIndex,
    isGenerating,
    streamingText,
    error,
    savedDeckId,
    savedCount,
    setTopic,
    setCardCount,
    generateFlashcards,
    exportToDeck,
    startStudy,
    openCardAt,
    nextCard,
    prevCard,
    exitStudy,
    reset,
    cancelGeneration,
  }
}
