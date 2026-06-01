export const CITY_VITALITY = {
  min: 0,
  max: 100,
  default: 100,
  highThreshold: 70,
  lowThreshold: 40,
  studyDayGain: 2,
  localMissionGain: 1,
  contractCompleteGain: 3,
  missedStudyDayPenalty: 5,
  maxMissedDayPenalty: 15,
  highXpBonusPercent: 5,
  highCoinBonusPercent: 3,
  lowCoinPenaltyPercent: 5,
  parkPetHappinessBonus: 12,
  parkPetAffinityBonus: 5,
} as const;

export const INTERNATIONAL_DISTRICT_KEY = 'internacional';

export const CENTRO_POI_KEYS = [
  'town_hall',
  'central_library',
  'study_cafe',
  'corner_shop',
] as const;

export const INTERNATIONAL_UNLOCK = {
  minPlayerLevel: 20,
  centroLocalLevel2Ratio: 0.4,
} as const;

export const SEASON_MUSEUM_POI_KEY = 'season_museum';

export const AIRPORT_POI_KEY = 'airport_gate';

export const EMBASSY_POI_KEY = 'embassy_row';
