import { GameEvents } from '@/services/game-events'
import type { FarmActivityTypeValue } from '@/types/farm'

import { LearningCurriculumService } from './learning-curriculum-service'
import { LearningGpsService } from './learning-gps-service'

let listenersInitialized = false

export const LearningGpsFarmBridge = {
  initListeners(): void {
    if (listenersInitialized) return
    listenersInitialized = true

    GameEvents.subscribe((event) => {
      if (event.type !== 'FARM_ACTIVITY_RECORDED') return
      const activityType = event.activityType as FarmActivityTypeValue
      void LearningGpsService.creditFromFarmActivity(activityType, event.amount)
      void LearningCurriculumService.creditFromFarmActivity(activityType, event.amount)
    })
  },
}
