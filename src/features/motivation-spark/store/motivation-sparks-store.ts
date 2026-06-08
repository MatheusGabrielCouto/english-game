import { create } from 'zustand'

import type { MotivationSparkRecord } from '@/types/motivation-spark'

export type MotivationSparksState = {
  sparks: MotivationSparkRecord[]
  hasHydrated: boolean
  isSyncing: boolean
}

export const useMotivationSparksStore = create<MotivationSparksState>(() => ({
  sparks: [],
  hasHydrated: false,
  isSyncing: false,
}))
