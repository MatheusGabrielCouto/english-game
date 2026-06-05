import type { PetPassiveAbility } from '@/features/game-design/catalogs/pet-species-catalog';

import type { PetInstanceStats } from '@/types/pet-instance';
import { PetGender, type PetGenderValue } from '@/types/pet-instance';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import {
    clampStat,
    createEmptyStats,
    parseStatsJson,
    PET_SPECIES_BASE_STATS,
    RARITY_STAT_RANGE,
    serializeStats,
    STAT_FOR_PASSIVE,
} from '../catalogs/pet-stat-rules';

const randomInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1));

export const PetStatsService = {
  parseStatsJson,
  serializeStats,

  rollGender(seed?: number): PetGenderValue {
    if (seed !== undefined) return seed % 2 === 0 ? PetGender.FEMALE : PetGender.MALE;
    return Math.random() < 0.5 ? PetGender.FEMALE : PetGender.MALE;
  },

  rollInitialStats(speciesKey: string): PetInstanceStats {
    const species = getSpeciesDefinition(speciesKey);
    const range = RARITY_STAT_RANGE[species.rarity];
    const bias = PET_SPECIES_BASE_STATS[speciesKey] ?? {};
    const stats = createEmptyStats();

    for (const key of Object.keys(stats) as (keyof PetInstanceStats)[]) {
      const base = bias[key] ?? randomInt(range.min, range.max);
      stats[key] = clampStat(base + randomInt(0, 5), range.cap);
    }
    return stats;
  },

  computeEffectivePassive(speciesKey: string, stats: PetInstanceStats): number {
    const species = getSpeciesDefinition(speciesKey);
    const passive: PetPassiveAbility = species.passive;
    const statKey = STAT_FOR_PASSIVE[passive.type];
    const statValue = stats[statKey] ?? 10;
    return passive.value * (1 + (statValue - 10) / 100);
  },

  formatPassiveLabel(speciesKey: string, stats: PetInstanceStats): string {
    const species = getSpeciesDefinition(speciesKey);
    const value = Math.round(PetStatsService.computeEffectivePassive(speciesKey, stats));
    const suffix =
      species.passive.type === 'shield_weekly'
        ? `+${value} escudo${value === 1 ? '' : 's'}/sem`
        : `+${value}%`;
    const typeLabel =
      species.passive.type === 'xp_boost'
        ? 'XP'
        : species.passive.type === 'coin_boost'
          ? 'Coins'
          : species.passive.type === 'loot_luck'
            ? 'Loot'
            : 'Shield';
    return `${suffix} ${typeLabel}`;
  },
};
