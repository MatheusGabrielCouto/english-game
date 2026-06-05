import type { PetRarityValue } from '@/types/pet';
import type { PetInstance } from '@/types/pet-instance';

import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import {
    getTraitDefinition,
    isEpicPlusTrait,
    PET_TRAITS_BY_KEY,
    PET_TRAITS_CATALOG,
    traitAppliesToSpecies,
    type PetTraitDefinition,
} from '../catalogs/pet-traits-catalog';
import {
    PET_TRAIT_INHERIT_CHANCE,
    PET_TRAIT_NEGATIVE_CHANCE_COMMON,
    PET_TRAIT_NEGATIVE_CHANCE_RARE_PLUS,
    PET_TRAIT_SLOT_COUNT,
} from '../constants/pet-trait-balance';

const POOL_WEIGHT: Record<PetTraitDefinition['poolRarity'], number> = {
  common: 40,
  uncommon: 28,
  rare: 20,
  epic: 8,
};

const pickWeighted = (pool: PetTraitDefinition[]): PetTraitDefinition | null => {
  if (pool.length === 0) return null;
  const total = pool.reduce((sum, t) => sum + POOL_WEIGHT[t.poolRarity], 0);
  let roll = Math.random() * total;
  for (const trait of pool) {
    roll -= POOL_WEIGHT[trait.poolRarity];
    if (roll <= 0) return trait;
  }
  return pool[pool.length - 1] ?? null;
};

const negativeChanceForSpecies = (speciesRarity: PetRarityValue): number =>
  speciesRarity === 'common' ? PET_TRAIT_NEGATIVE_CHANCE_COMMON : PET_TRAIT_NEGATIVE_CHANCE_RARE_PLUS;

const buildRollPool = (
  speciesRarity: PetRarityValue,
  usedKeys: Set<string>,
  wantNegative: boolean,
): PetTraitDefinition[] =>
  PET_TRAITS_CATALOG.filter(
    (t) =>
      !usedKeys.has(t.key) &&
      t.isNegative === wantNegative &&
      traitAppliesToSpecies(t, speciesRarity),
  );

const rollNewTrait = (
  speciesRarity: PetRarityValue,
  usedKeys: Set<string>,
  allowEpicPlus: boolean,
): string | null => {
  const wantNegative = Math.random() < negativeChanceForSpecies(speciesRarity);
  let pool = buildRollPool(speciesRarity, usedKeys, wantNegative);
  if (pool.length === 0) {
    pool = buildRollPool(speciesRarity, usedKeys, !wantNegative);
  }
  if (!allowEpicPlus) {
    pool = pool.filter((t) => !isEpicPlusTrait(t));
  }
  const picked = pickWeighted(pool);
  return picked?.key ?? null;
};

const pickInherited = (parentKeys: string[], usedKeys: Set<string>): string | null => {
  const candidates = parentKeys.filter((k) => !usedKeys.has(k) && PET_TRAITS_BY_KEY[k]);
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
};

export const PetTraitRollService = {
  slotCountForSpecies(speciesKey: string): number {
    const species = getSpeciesDefinition(speciesKey);
    return PET_TRAIT_SLOT_COUNT[species.rarity] ?? 1;
  },

  rollInitialTraits(speciesKey: string): string[] {
    const species = getSpeciesDefinition(speciesKey);
    const count = PetTraitRollService.slotCountForSpecies(speciesKey);
    const used = new Set<string>();
    const keys: string[] = [];
    let epicPlus = 0;

    for (let i = 0; i < count; i += 1) {
      const allowEpic = epicPlus < 1;
      const key = rollNewTrait(species.rarity, used, allowEpic);
      if (!key) break;
      const def = getTraitDefinition(key);
      if (def && isEpicPlusTrait(def)) epicPlus += 1;
      used.add(key);
      keys.push(key);
    }

    return keys;
  },

  rollBreedingTraits(
    speciesKey: string,
    mother: PetInstance | null,
    father: PetInstance | null,
  ): string[] {
    const species = getSpeciesDefinition(speciesKey);
    const count = PetTraitRollService.slotCountForSpecies(speciesKey);
    const parentPool = [...(mother?.traitKeys ?? []), ...(father?.traitKeys ?? [])];
    const used = new Set<string>();
    const keys: string[] = [];
    let epicPlus = 0;

    for (let i = 0; i < count; i += 1) {
      let key: string | null = null;
      if (parentPool.length > 0 && Math.random() < PET_TRAIT_INHERIT_CHANCE) {
        key = pickInherited(parentPool, used);
      }
      if (key) {
        const def = getTraitDefinition(key);
        if (def && isEpicPlusTrait(def) && epicPlus >= 1) {
          key = null;
        }
      }
      if (!key) {
        key = rollNewTrait(species.rarity, used, epicPlus < 1);
      }
      if (!key) break;
      const def = getTraitDefinition(key);
      if (def && isEpicPlusTrait(def)) epicPlus += 1;
      used.add(key);
      keys.push(key);
    }

    return keys;
  },

  rerollSlot(
    speciesKey: string,
    currentKeys: string[],
    slotIndex: number,
  ): string[] {
    const species = getSpeciesDefinition(speciesKey);
    const next = [...currentKeys];
    const used = new Set(next.filter((_, i) => i !== slotIndex));
    const epicPlus = next.filter((k, i) => i !== slotIndex && isEpicPlusTrait(PET_TRAITS_BY_KEY[k]!)).length;
    const key = rollNewTrait(species.rarity, used, epicPlus < 1);
    if (!key) return next;
    if (slotIndex < next.length) {
      next[slotIndex] = key;
    } else {
      next.push(key);
    }
    return next.slice(0, PetTraitRollService.slotCountForSpecies(speciesKey));
  },

  rerollAll(speciesKey: string): string[] {
    return PetTraitRollService.rollInitialTraits(speciesKey);
  },
};
