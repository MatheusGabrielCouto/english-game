import type { LearningSkillKeyValue } from '@/types/learning-gps'

import { useMentorGpsStudyStore, type MentorGpsStudyContext } from '../store/mentor-gps-study-store'
import { MentorExerciseService } from './mentor-exercise-service'
import { MentorFlashcardService } from './mentor-flashcard-service'

type GpsStudyParams = {
  gps?: string
  unitKey?: string
  blockId?: string
  skill?: string
  title?: string
  topic?: string
  description?: string
  tab?: string
}

const isSkillKey = (value: string | undefined): value is LearningSkillKeyValue =>
  value === 'vocabulary' ||
  value === 'reading' ||
  value === 'listening' ||
  value === 'speaking' ||
  value === 'writing' ||
  value === 'grammar'

export const MentorGpsStudyService = {
  getContext(): MentorGpsStudyContext {
    return useMentorGpsStudyStore.getState()
  },

  isActive(): boolean {
    return useMentorGpsStudyStore.getState().active
  },

  clear(): void {
    useMentorGpsStudyStore.getState().clearContext()
  },

  hydrateFromParams(params: GpsStudyParams): MentorGpsStudyContext | null {
    if (params.gps !== '1' || !params.title?.trim() || !isSkillKey(params.skill)) {
      useMentorGpsStudyStore.getState().clearContext()
      return null
    }

    const topic = params.topic?.trim() || params.title.trim()
    const tab = params.tab === 'flashcards' ? 'flashcards' : null

    const context: MentorGpsStudyContext = {
      active: true,
      unitKey: params.unitKey?.trim() || null,
      blockId: params.blockId?.trim() || null,
      skillKey: params.skill,
      title: params.title.trim(),
      topic,
      description: params.description?.trim() || null,
      tab,
    }

    useMentorGpsStudyStore.getState().setContext(context)
    MentorExerciseService.setTopic(topic)
    MentorFlashcardService.setTopic(topic)

    return context
  },

  async creditProgress(minutes = 10): Promise<void> {
    const context = useMentorGpsStudyStore.getState()
    if (!context.active || !context.skillKey) return

    const { LearningGpsMentorBridge } = await import(
      '@/features/learning-gps/services/learning-gps-mentor-bridge'
    )
    await LearningGpsMentorBridge.creditFromStudy({
      skillKey: context.skillKey,
      minutes,
      unitKey: context.unitKey,
      blockId: context.blockId,
    })
  },
}
