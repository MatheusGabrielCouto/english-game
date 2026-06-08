import { GameEvents } from '@/services/game-events'

import { LearningGpsService } from './learning-gps-service'

export const LearningGpsRoutineBridge = {
  initListeners(): void {
    GameEvents.subscribe((event) => {
      if (event.type !== 'ROUTINE_COMPLETED') return
      void LearningGpsService.creditFromRoutineCompletion(event.routineId)
    })
  },
}
