import type { PetRarityValue } from '@/types/pet';

/** Tetos de stack só de traits (companheiro ativo), antes do cap global. */
export const PET_TRAIT_BONUS_CAPS = {
  xp_percent: 18,
  coin_percent: 18,
  loot_percent: 12,
  contract_percent: 15,
} as const;

export const PET_TRAIT_SLOT_COUNT: Record<PetRarityValue, number> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export const PET_TRAIT_INHERIT_CHANCE = 0.6;
export const PET_TRAIT_NEGATIVE_CHANCE_COMMON = 0.15;
export const PET_TRAIT_NEGATIVE_CHANCE_RARE_PLUS = 0.08;

export const PET_TRAIT_REROLL_COIN_PER_GEN = 800;
export const PET_TRAIT_REROLL_COIN_CAP = 50_000;

export const computeTraitRerollCoinCost = (generation: number): number =>
  Math.min(PET_TRAIT_REROLL_COIN_CAP, PET_TRAIT_REROLL_COIN_PER_GEN * Math.max(1, generation));
