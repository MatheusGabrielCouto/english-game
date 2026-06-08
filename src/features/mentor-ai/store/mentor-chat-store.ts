import { create } from 'zustand'

import type { MentorChatState } from '@/types/mentor-ai'

export const useMentorChatStore = create<MentorChatState>(() => ({
  sessionId: null,
  messages: [],
  isGenerating: false,
  streamingText: '',
  hasHydrated: false,
  error: null,
  lastCapturedGoal: null,
}))
