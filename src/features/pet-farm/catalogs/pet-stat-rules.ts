import type { PetPassiveAbility } from '@/features/game-design/catalogs/pet-species-catalog';
import { PetRarity, type PetRarityValue } from '@/types/pet';
import {
    PET_STAT_KEYS,
    type PetInstanceStats,
    type PetStatKeyValue,
} from '@/types/pet-instance';

export const PET_STAT_LABELS: Record<PetStatKeyValue, string> = {
  strength: 'Força',
  focus: 'Foco',
  luck: 'Sorte',
  resilience: 'Resiliência',
  charm: 'Carisma',
};

export const STAT_FOR_PASSIVE: Record<PetPassiveAbility['type'], PetStatKeyValue> = {
  xp_boost: 'focus',
  coin_boost: 'strength',
  loot_luck: 'luck',
  shield_weekly: 'resilience',
};

export const RARITY_STAT_RANGE: Record<
  PetRarityValue,
  { min: number; max: number; cap: number }
> = {
  [PetRarity.COMMON]: { min: 8, max: 18, cap: 45 },
  [PetRarity.RARE]: { min: 12, max: 24, cap: 60 },
  [PetRarity.EPIC]: { min: 16, max: 30, cap: 75 },
  [PetRarity.LEGENDARY]: { min: 20, max: 35, cap: 90 },
};

export const PET_SPECIES_BASE_STATS: Record<string, Partial<PetInstanceStats>> = {
  codeowl: { focus: 14, strength: 8, luck: 10, resilience: 10, charm: 12 },
  debugduck: { strength: 10, focus: 8, luck: 12, resilience: 11, charm: 10 },
  apishark: { strength: 14, focus: 10, luck: 16, resilience: 12, charm: 8 },
  legendarylion: { strength: 18, focus: 14, luck: 12, resilience: 16, charm: 14 },
};

export const createEmptyStats = (): PetInstanceStats => ({
  strength: 10,
  focus: 10,
  luck: 10,
  resilience: 10,
  charm: 10,
});

export const clampStat = (value: number, cap: number): number =>
  Math.max(1, Math.min(cap, Math.round(value)));

export const parseStatsJson = (json: string): PetInstanceStats => {
  try {
    const parsed = JSON.parse(json) as Partial<PetInstanceStats>;
    const base = createEmptyStats();
    for (const key of PET_STAT_KEYS) {
      if (typeof parsed[key] === 'number') base[key] = parsed[key]!;
    }
    return base;
  } catch {
    return createEmptyStats();
  }
};

export const serializeStats = (stats: PetInstanceStats): string => JSON.stringify(stats);
