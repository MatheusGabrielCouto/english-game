export type CityEventScheduleRule = {
  type: 'fixed_annual';
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
};

export type CityEventDefinition = {
  eventKey: string;
  name: string;
  /** Rótulo curto para abas (ex.: "Halloween"). */
  tabLabel: string;
  emoji: string;
  description: string;
  priority: number;
  major: boolean;
  schedule: CityEventScheduleRule;
  vocabPackKey: string;
  mapThemeKey: string;
  spiritLabel: string;
  temporaryPoiKeys: string[];
  participatingPoiKeys: string[];
};

export type CityEventStateRecord = {
  eventKey: string;
  spiritProgress: number;
  vocabWordsLearned: number;
  introSeen: boolean;
  completedAt: string | null;
  startedAt: string | null;
  updatedAt: string;
};

export type ActiveCityEventViewModel = {
  eventKey: string;
  name: string;
  tabLabel: string;
  emoji: string;
  description: string;
  spiritLabel: string;
  mapThemeKey: string;
  daysRemaining: number;
  spiritProgress: number;
  vocabWordsLearned: number;
  vocabTarget: number;
  introSeen: boolean;
  milestonesReached: number[];
  participatingPoiKeys: string[];
  temporaryPoiKeys: string[];
};
