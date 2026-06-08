import { create } from 'zustand'

import type { CorrectionResult, MentorCorrectionState } from '@/types/mentor-ai'

const initialState: MentorCorrectionState = {
  input: '',
  result: null,
  isGenerating: false,
  streamingText: '',
  error: null,
  savedErrorId: null,
}

type MentorCorrectionStore = MentorCorrectionState & {
  setInput: (input: string) => void
  setGenerating: (isGenerating: boolean) => void
  setStreamingText: (streamingText: string) => void
  setResult: (result: CorrectionResult | null) => void
  setError: (error: string | null) => void
  setSavedErrorId: (savedErrorId: string | null) => void
  reset: () => void
}

export const useMentorCorrectionStore = create<MentorCorrectionStore>((set) => ({
  ...initialState,
  setInput: (input) => set({ input }),
  setGenerating: (isGenerating) => set({ isGenerating }),
  setStreamingText: (streamingText) => set({ streamingText }),
  setResult: (result) => set({ result }),
  setError: (error) => set({ error }),
  setSavedErrorId: (savedErrorId) => set({ savedErrorId }),
  reset: () => set(initialState),
}))
