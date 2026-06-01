import { useMissionsStore } from '@/features/quests/store/missions-store';
import { GameEvents, type GameEvent } from '@/services/game-events';

import {
  findIncompleteMissionByTemplateKey,
  LEARNING_DAILY_TEMPLATE_KEYS,
  shouldAutoCompleteDuelWinMission,
  shouldAutoCompleteFlashMission,
  shouldAutoCompleteFlawlessMission,
} from '../utils/learning-mission-utils';

let listenersInitialized = false;

const tryCompleteDaily = (templateKey: string): void => {
  const { missions, completeMission } = useMissionsStore.getState();
  const mission = findIncompleteMissionByTemplateKey(missions, templateKey);
  if (!mission) return;
  completeMission(mission.id);
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  switch (event.type) {
    case 'DUEL_WON':
      if (shouldAutoCompleteDuelWinMission(true, event.mode)) {
        tryCompleteDaily(LEARNING_DAILY_TEMPLATE_KEYS.duelWin);
      }
      if (shouldAutoCompleteFlawlessMission(true, event.flawless)) {
        tryCompleteDaily(LEARNING_DAILY_TEMPLATE_KEYS.duelFlawless);
      }
      break;
    case 'FLASH_SESSION_DONE':
      if (shouldAutoCompleteFlashMission(event.cardsReviewed)) {
        tryCompleteDaily(LEARNING_DAILY_TEMPLATE_KEYS.flashReview5);
      }
      break;
    default:
      break;
  }
};

export const LearningMissionBridge = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;
    GameEvents.subscribe((event) => {
      void handleGameEvent(event);
    });
  },
};
