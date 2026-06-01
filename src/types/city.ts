export type CityBuildingDefinition = {
  key: string;
  name: string;
  description: string;
  requiredLevel: number;
  icon: string;
  linkedTitleKey: string;
};

export type CityBuildingUnlockRecord = {
  buildingKey: string;
  unlockedAt: string;
  levelAtUnlock: number;
};

export type CityAnalyticsRecord = {
  currentBuildingKey: string;
  totalUnlocked: number;
  lastUnlockAt: string | null;
};

export type CityProgress = {
  currentLevel: number;
  currentBuilding: CityBuildingDefinition;
  nextBuilding: CityBuildingDefinition | null;
  levelsUntilNext: number | null;
  progressLabel: string;
};

export type CityBuildingViewModel = CityBuildingDefinition & {
  unlockedAt: string | null;
  isActive: boolean;
};

export type CityUnlockPayload = {
  building: CityBuildingDefinition;
  unlockedAt: string;
  levelAtUnlock: number;
};

export type CitySummary = {
  unlocked: number;
  total: number;
  currentBuildingKey: string;
};
