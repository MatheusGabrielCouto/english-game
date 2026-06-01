export const LocalMissionType = {
  COMPLETE_DAILY_GLOBAL: 'complete_daily_global',
  STUDY_DAY: 'study_day',
  FOCUS_SESSION: 'focus_session',
  SPEAKING_UNITS: 'speaking_units',
  PET_VISIT: 'pet_visit',
  LEARN_EVENT_VOCAB: 'learn_event_vocab',
} as const;

export type LocalMissionTypeValue =
  (typeof LocalMissionType)[keyof typeof LocalMissionType];

export type CityPoiMission = {
  id: string;
  poiKey: string;
  missionDate: string;
  templateKey: string;
  title: string;
  description: string;
  missionType: LocalMissionTypeValue;
  targetValue: number;
  currentValue: number;
  xpReward: number;
  coinReward: number;
  localXpReward: number;
  completed: boolean;
  claimed: boolean;
  createdAt: string;
  /** null = missão rotineira; string = missão de evento da cidade */
  eventKey: string | null;
  chainKey: string | null;
  chainStep: number | null;
};

export type PoiMissionStatus = 'in_progress' | 'completed' | 'claimed';

export const getPoiMissionStatus = (mission: CityPoiMission): PoiMissionStatus => {
  if (mission.claimed) return 'claimed';
  if (mission.completed || mission.currentValue >= mission.targetValue) return 'completed';
  return 'in_progress';
};
