import { create } from 'zustand'

import type { MentorFlashcardSet, MentorFlashcardState } from '@/types/mentor-ai'

const initialState: MentorFlashcardState = {
  topic: '',
  cardCount: 10,
  flashcardSet: null,
  phase: 'input',
  currentIndex: 0,
  isGenerating: false,
  streamingText: '',
  error: null,
  savedDeckId: null,
  savedCount: 0,
}

type MentorFlashcardStore = MentorFlashcardState & {
  setTopic: (topic: string) => void
  setCardCount: (cardCount: number) => void
  setFlashcardSet: (flashcardSet: MentorFlashcardSet | null) => void
  setPhase: (phase: MentorFlashcardState['phase']) => void
  setCurrentIndex: (currentIndex: number) => void
  setGenerating: (isGenerating: boolean) => void
  setStreamingText: (streamingText: string) => void
  setError: (error: string | null) => void
  setSavedDeckId: (savedDeckId: string | null) => void
  setSavedCount: (savedCount: number) => void
  reset: () => void
}

export const useMentorFlashcardStore = create<MentorFlashcardStore>((set) => ({
  ...initialState,
  setTopic: (topic) => set({ topic }),
  setCardCount: (cardCount) => set({ cardCount }),
  setFlashcardSet: (flashcardSet) => set({ flashcardSet }),
  setPhase: (phase) => set({ phase }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setStreamingText: (streamingText) => set({ streamingText }),
  setError: (error) => set({ error }),
  setSavedDeckId: (savedDeckId) => set({ savedDeckId }),
  setSavedCount: (savedCount) => set({ savedCount }),
  reset: () => set(initialState),
}))
