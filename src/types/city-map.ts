export type PoiCategory =
  | 'civic'
  | 'education'
  | 'commerce'
  | 'work'
  | 'culture'
  | 'travel'
  | 'social';

export type CityDistrictDefinition = {
  districtKey: string;
  name: string;
  description: string;
  requiredPlayerLevel: number;
  mapEmoji: string;
};

export type CityPoiDefinition = {
  poiKey: string;
  name: string;
  description: string;
  category: PoiCategory;
  districtKey: string;
  icon: string;
  npcName: string;
  npcEmoji: string;
  requiredPlayerLevel: number;
  maxLocalLevel: number;
  positionX: number;
  positionY: number;
  /** Só aparece no mapa durante evento ativo (ex.: winter_market) */
  eventOnly?: boolean;
};

export type CityDistrictRecord = {
  districtKey: string;
  unlockedAt: string | null;
  unlockReason: string | null;
};

export type CityPoiRecord = {
  poiKey: string;
  districtKey: string;
  category: PoiCategory;
  localLevel: number;
  localXp: number;
  positionX: number;
  positionY: number;
  unlockedAt: string | null;
  visualStage: number;
  npcTrust: number;
};

export type CityMapStateRecord = {
  cityName: string;
  cityVitality: number;
  activeRumorKey: string | null;
  rumorUpdatedAt: string | null;
  updatedAt: string;
};

export type CityRumorViewModel = {
  key: string;
  message: string;
  npcHint: string | null;
};

export type CityVitalityBand = 'low' | 'mid' | 'high';

export type CityDistrictViewModel = CityDistrictDefinition & {
  unlockedAt: string | null;
  isUnlocked: boolean;
  isLockedByLevel: boolean;
};

export type CityPoiViewModel = CityPoiDefinition & {
  localLevel: number;
  localXp: number;
  visualStage: number;
  unlockedAt: string | null;
  isUnlocked: boolean;
  isLockedByLevel: boolean;
  isLockedByDistrict: boolean;
  specialLockReason: string | null;
  localXpToNextLevel: number;
  localXpProgressPercent: number;
  npcTrust: number;
};

export type CityMapSummary = {
  cityName: string;
  cityVitality: number;
  vitalityBand: CityVitalityBand;
  unlockedPoiCount: number;
  totalPoiCount: number;
};
