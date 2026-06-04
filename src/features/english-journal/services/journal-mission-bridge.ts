import { findIncompleteMissionByTemplateKey } from '@/features/learning/utils/learning-mission-utils';
import { useMissionsStore } from '@/features/quests/store/missions-store';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { JournalEntryType } from '@/types/journal';

import { JOURNAL_DAILY_TEMPLATE_KEYS } from '../catalogs/journal-missions-catalog';

let listenersInitialized = false;
let notesCreatedToday = 0;
let lastDayKey = '';

const getDayKey = (): string => new Date().toISOString().slice(0, 10);

const resetDailyCounterIfNeeded = (): void => {
  const day = getDayKey();
  if (day !== lastDayKey) {
    lastDayKey = day;
    notesCreatedToday = 0;
  }
};

const tryCompleteDaily = (templateKey: string): void => {
  const { missions, completeMission } = useMissionsStore.getState();
  const mission = findIncompleteMissionByTemplateKey(missions, templateKey);
  if (!mission) return;
  completeMission(mission.id);
};

const handleGameEvent = (event: GameEvent): void => {
  switch (event.type) {
    case 'JOURNAL_ENTRY_CREATED':
      resetDailyCounterIfNeeded();
      notesCreatedToday += 1;
      if (event.isVoice || event.entryType === JournalEntryType.VOICE_NOTE) {
        tryCompleteDaily(JOURNAL_DAILY_TEMPLATE_KEYS.voiceNote);
      }
      if (notesCreatedToday >= 3) {
        tryCompleteDaily(JOURNAL_DAILY_TEMPLATE_KEYS.create3);
      }
      break;
    case 'JOURNAL_ENTRY_REVIEWED':
      tryCompleteDaily(JOURNAL_DAILY_TEMPLATE_KEYS.reviewOld);
      break;
    case 'JOURNAL_VOICE_REPLAYED':
      tryCompleteDaily(JOURNAL_DAILY_TEMPLATE_KEYS.replayVoice);
      break;
    default:
      break;
  }
};

export const JournalMissionBridge = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;
    GameEvents.subscribe((event) => {
      handleGameEvent(event);
    });
  },
};
