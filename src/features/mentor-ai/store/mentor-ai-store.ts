import { create } from 'zustand'

import type { MentorDashboardSnapshot } from '@/types/mentor-ai'

type MentorAiState = {
  snapshot: MentorDashboardSnapshot | null
  hasHydrated: boolean
  isSyncing: boolean
}

export const useMentorAiStore = create<MentorAiState>(() => ({
  snapshot: null,
  hasHydrated: false,
  isSyncing: false,
}))
