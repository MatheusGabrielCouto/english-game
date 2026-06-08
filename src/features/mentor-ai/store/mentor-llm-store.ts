import { create } from 'zustand'

export type MentorLlmStatus =
  | 'idle'
  | 'copying'
  | 'loading'
  | 'ready'
  | 'missing'
  | 'error'
  | 'unsupported'

type MentorLlmState = {
  status: MentorLlmStatus
  modelPath: string | null
  error: string | null
}

export const useMentorLlmStore = create<MentorLlmState>(() => ({
  status: 'idle',
  modelPath: null,
  error: null,
}))
