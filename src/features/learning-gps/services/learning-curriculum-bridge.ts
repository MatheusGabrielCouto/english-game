import { GameEvents } from '@/services/game-events'

import { LearningCurriculumService } from './learning-curriculum-service'

let listenersInitialized = false

export const LearningCurriculumBridge = {
  initListeners(): void {
    if (listenersInitialized) return
    listenersInitialized = true

    GameEvents.subscribe((event) => {
      if (event.type === 'DUEL_WON' && event.mode !== 'patent_exam') {
        void LearningCurriculumService.creditFromDuelWin()
      }
    })
  },
}
