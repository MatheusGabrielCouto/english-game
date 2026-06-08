import { GameEvents } from '@/services/game-events'

import { LearningGpsService } from './learning-gps-service'

let listenersInitialized = false

export const LearningGpsMentorBridge = {
  initListeners(): void {
    if (listenersInitialized) return
    listenersInitialized = true

    GameEvents.subscribe((event) => {
      if (
        event.type !== 'MENTOR_EXERCISE_COMPLETED' &&
        event.type !== 'MENTOR_ROLEPLAY_COMPLETED' &&
        event.type !== 'MENTOR_SESSION_COMPLETED'
      ) {
        return
      }

      void (async () => {
        const { MentorGpsStudyService } = await import(
          '@/features/mentor-ai/services/mentor-gps-study-service'
        )
        if (!MentorGpsStudyService.isActive()) return

        const context = MentorGpsStudyService.getContext()
        if (!context.skillKey) return

        const minutes =
          event.type === 'MENTOR_SESSION_COMPLETED' ? Math.max(5, event.durationMinutes) : 10

        await LearningGpsMentorBridge.creditFromStudy({
          skillKey: context.skillKey,
          minutes,
          unitKey: context.unitKey,
          blockId: context.blockId,
        })
      })()
    })
  },

  async creditFromStudy(input: {
    skillKey: import('@/types/learning-gps').LearningSkillKeyValue
    minutes: number
    unitKey?: string | null
    blockId?: string | null
  }): Promise<void> {
    await LearningGpsService.creditFromMentorStudy(input)
  },
}
