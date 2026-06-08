import { create } from 'zustand'

import type { MentorExerciseSet, MentorExerciseState } from '@/types/mentor-ai'

const initialState: MentorExerciseState = {
  topic: '',
  exerciseSet: null,
  phase: 'input',
  isGenerating: false,
  streamingText: '',
  error: null,
  sessionId: null,
  currentIndex: 0,
  selectedIndex: null,
  showExplanation: false,
  correctCount: 0,
  answers: [],
  resultFeedback: null,
  isGeneratingFeedback: false,
}

type MentorExerciseStore = MentorExerciseState & {
  setTopic: (topic: string) => void
  setExerciseSet: (exerciseSet: MentorExerciseSet | null) => void
  setPhase: (phase: MentorExerciseState['phase']) => void
  setGenerating: (isGenerating: boolean) => void
  setStreamingText: (streamingText: string) => void
  setError: (error: string | null) => void
  setSessionId: (sessionId: string | null) => void
  setCurrentIndex: (currentIndex: number) => void
  setSelectedIndex: (selectedIndex: number | null) => void
  setShowExplanation: (showExplanation: boolean) => void
  setCorrectCount: (correctCount: number) => void
  reset: () => void
}

export const useMentorExerciseStore = create<MentorExerciseStore>((set) => ({
  ...initialState,
  setTopic: (topic) => set({ topic }),
  setExerciseSet: (exerciseSet) => set({ exerciseSet }),
  setPhase: (phase) => set({ phase }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setStreamingText: (streamingText) => set({ streamingText }),
  setError: (error) => set({ error }),
  setSessionId: (sessionId) => set({ sessionId }),
  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setSelectedIndex: (selectedIndex) => set({ selectedIndex }),
  setShowExplanation: (showExplanation) => set({ showExplanation }),
  setCorrectCount: (correctCount) => set({ correctCount }),
  reset: () => set(initialState),
}))
