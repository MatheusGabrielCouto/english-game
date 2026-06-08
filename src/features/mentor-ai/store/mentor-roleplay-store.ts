import { create } from 'zustand'

import type { MentorRoleplayState } from '@/types/mentor-ai'

const initialState: MentorRoleplayState = {
  phase: 'pick',
  mode: null,
  role: null,
  track: null,
  sessionId: null,
  messages: [],
  turnCount: 0,
  isGenerating: false,
  streamingText: '',
  error: null,
  feedback: null,
}

type MentorRoleplayStore = MentorRoleplayState & {
  reset: () => void
}

export const useMentorRoleplayStore = create<MentorRoleplayStore>((set) => ({
  ...initialState,
  reset: () => set(initialState),
}))
