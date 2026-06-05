import { PET_STAT_KEYS, type PetInstanceStats } from '@/types/pet-instance';

import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import { clampStat, RARITY_STAT_RANGE } from '../catalogs/pet-stat-rules';

const rollUpgrade = (): number => {
  const r = Math.random();
  if (r < 0.35) return 0;
  if (r < 0.75) return 1 + Math.floor(Math.random() * 3);
  if (r < 0.93) return 4 + Math.floor(Math.random() * 3);
  return 7 + Math.floor(Math.random() * 4);
};

export const inheritStatsFromParents = (
  mother: PetInstanceStats,
  father: PetInstanceStats,
  speciesKey: string,
  sameSpeciesBonus = false,
): PetInstanceStats => {
  const species = getSpeciesDefinition(speciesKey);
  const cap = RARITY_STAT_RANGE[species.rarity].cap;
  const result = {} as PetInstanceStats;

  for (const key of PET_STAT_KEYS) {
    const base = Math.max(mother[key], father[key]);
    let upgrade = rollUpgrade();
    if (sameSpeciesBonus && Math.random() < 0.05 && upgrade < 4) {
      upgrade = 4 + Math.floor(Math.random() * 3);
    }
    result[key] = clampStat(base + upgrade, cap);
  }

  return result;
};

export const estimateStatRange = (
  mother: PetInstanceStats,
  father: PetInstanceStats,
): { min: PetInstanceStats; max: PetInstanceStats } => {
  const min = {} as PetInstanceStats;
  const max = {} as PetInstanceStats;
  for (const key of PET_STAT_KEYS) {
    const base = Math.max(mother[key], father[key]);
    min[key] = base;
    max[key] = base + 10;
  }
  return { min, max };
};
