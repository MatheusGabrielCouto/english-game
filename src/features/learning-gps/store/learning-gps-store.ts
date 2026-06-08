import { create } from 'zustand'

import type { LearningGpsSnapshot } from '@/types/learning-gps'

type LearningGpsState = {
  snapshot: LearningGpsSnapshot | null
  hasHydrated: boolean
  isSyncing: boolean
  setSnapshot: (snapshot: LearningGpsSnapshot | null) => void
  setHasHydrated: (value: boolean) => void
  setIsSyncing: (value: boolean) => void
}

export const useLearningGpsStore = create<LearningGpsState>()((set) => ({
  snapshot: null,
  hasHydrated: false,
  isSyncing: false,
  setSnapshot: (snapshot) => set({ snapshot }),
  setHasHydrated: (value) => set({ hasHydrated: value }),
  setIsSyncing: (value) => set({ isSyncing: value }),
}))
