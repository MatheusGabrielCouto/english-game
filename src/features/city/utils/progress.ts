import { BUILDING_DEFINITIONS } from '../constants/default-buildings';
import type { CityBuildingDefinition, CityProgress } from '@/types/city';

const CITY_COMPLETE_LABEL = 'Sua cidade está completamente desenvolvida.';

export const resolveBuildingForLevel = (level: number): CityBuildingDefinition => {
  let current = BUILDING_DEFINITIONS[0];

  for (const building of BUILDING_DEFINITIONS) {
    if (level >= building.requiredLevel) {
      current = building;
    }
  }

  return current;
};

export const getNextBuilding = (level: number): CityBuildingDefinition | null =>
  BUILDING_DEFINITIONS.find((building) => building.requiredLevel > level) ?? null;

export const getEligibleBuildings = (level: number): CityBuildingDefinition[] =>
  BUILDING_DEFINITIONS.filter((building) => level >= building.requiredLevel);

export const buildCityProgress = (level: number): CityProgress => {
  const currentBuilding = resolveBuildingForLevel(level);
  const nextBuilding = getNextBuilding(level);
  const levelsUntilNext = nextBuilding ? nextBuilding.requiredLevel - level : null;

  const progressLabel = nextBuilding
    ? `Próxima: ${nextBuilding.name} · Nível ${nextBuilding.requiredLevel}`
    : CITY_COMPLETE_LABEL;

  return {
    currentLevel: level,
    currentBuilding,
    nextBuilding,
    levelsUntilNext,
    progressLabel,
  };
};

export const sortBuildingsByLevel = (
  buildings: CityBuildingDefinition[],
): CityBuildingDefinition[] =>
  [...buildings].sort((left, right) => left.requiredLevel - right.requiredLevel);
