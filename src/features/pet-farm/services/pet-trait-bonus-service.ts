import { getTraitDefinition } from '../catalogs/pet-traits-catalog';
import { PET_TRAIT_BONUS_CAPS } from '../constants/pet-trait-balance';

export type AggregatedTraitBonuses = {
  xp_percent: number;
  coin_percent: number;
  loot_percent: number;
  contract_percent: number;
  labels: string[];
};

const EMPTY: AggregatedTraitBonuses = {
  xp_percent: 0,
  coin_percent: 0,
  loot_percent: 0,
  contract_percent: 0,
  labels: [],
};

const clampSigned = (value: number, cap: number): number =>
  Math.max(-cap, Math.min(cap, value));

export const PetTraitBonusService = {
  aggregateFromTraitKeys(traitKeys: string[]): AggregatedTraitBonuses {
    if (traitKeys.length === 0) return EMPTY;

    let xp = 0;
    let coins = 0;
    let loot = 0;
    let contract = 0;
    const labels: string[] = [];

    for (const key of traitKeys) {
      const def = getTraitDefinition(key);
      if (!def) continue;
      const { globalEffects } = def;
      if (globalEffects.xp_percent) xp += globalEffects.xp_percent;
      if (globalEffects.coin_percent) coins += globalEffects.coin_percent;
      if (globalEffects.loot_percent) loot += globalEffects.loot_percent;
      if (globalEffects.contract_percent) contract += globalEffects.contract_percent;
      if (Object.keys(globalEffects).length > 0) {
        labels.push(def.name);
      }
    }

    return {
      xp_percent: clampSigned(xp, PET_TRAIT_BONUS_CAPS.xp_percent),
      coin_percent: clampSigned(coins, PET_TRAIT_BONUS_CAPS.coin_percent),
      loot_percent: clampSigned(loot, PET_TRAIT_BONUS_CAPS.loot_percent),
      contract_percent: clampSigned(contract, PET_TRAIT_BONUS_CAPS.contract_percent),
      labels,
    };
  },
};
