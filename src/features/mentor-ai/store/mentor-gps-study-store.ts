import { create } from 'zustand'

import type { LearningSkillKeyValue } from '@/types/learning-gps'

export type MentorGpsStudyContext = {
  active: boolean
  unitKey: string | null
  blockId: string | null
  skillKey: LearningSkillKeyValue | null
  title: string
  topic: string
  description: string | null
  tab: 'exercise' | 'flashcards' | null
}

type MentorGpsStudyStore = MentorGpsStudyContext & {
  setContext: (context: MentorGpsStudyContext) => void
  clearContext: () => void
}

const INITIAL: MentorGpsStudyContext = {
  active: false,
  unitKey: null,
  blockId: null,
  skillKey: null,
  title: '',
  topic: '',
  description: null,
  tab: null,
}

export const useMentorGpsStudyStore = create<MentorGpsStudyStore>((set) => ({
  ...INITIAL,
  setContext: (context) => set(context),
  clearContext: () => set(INITIAL),
}))
