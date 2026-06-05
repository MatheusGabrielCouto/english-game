import type { PetPassiveAbility } from '@/features/game-design/catalogs/pet-species-catalog';

import { PetFarmRepository } from '@/storage/repositories/pet-farm-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import {
    PET_FARM_PASSIVE_CAPS,
    slotEfficiencyForFieldLevel,
} from '../catalogs/pet-farm-catalog';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';

export type AggregatedFarmBonuses = {
  xp_boost: number;
  coin_boost: number;
  loot_luck: number;
  shield_weekly: number;
};

const emptyBonuses = (): AggregatedFarmBonuses => ({
  xp_boost: 0,
  coin_boost: 0,
  loot_luck: 0,
  shield_weekly: 0,
});

export const PetFarmBonusService = {
  async getAggregatedBonuses(): Promise<AggregatedFarmBonuses> {
    const fields = await PetFarmRepository.getFieldLevels();
    const pastureLevel = fields.passive_pasture;
    const maxSlots = pastureLevel;
    const efficiency = slotEfficiencyForFieldLevel(pastureLevel);
    const instances = await PetInstanceRepository.listAll();
    const slotted = instances
      .filter((i) => i.passiveFieldSlot !== null)
      .sort((a, b) => b.effectivePassiveValue - a.effectivePassiveValue)
      .slice(0, maxSlots);

    const totals = emptyBonuses();
    const caps = PET_FARM_PASSIVE_CAPS;

    for (const instance of slotted) {
      const species = getSpeciesDefinition(instance.speciesKey);
      const passive: PetPassiveAbility = species.passive;
      const charmFactor = 1 + instance.stats.charm / 200;
      const contribution = instance.effectivePassiveValue * efficiency * charmFactor;

      if (passive.type === 'shield_weekly') {
        if (totals.shield_weekly < caps.shield_weekly) {
          totals.shield_weekly += Math.min(caps.shield_weekly - totals.shield_weekly, passive.value);
        }
        continue;
      }

      const key = passive.type as keyof Omit<AggregatedFarmBonuses, 'shield_weekly'>;
      const cap = caps[key];
      totals[key] = Math.min(cap, totals[key] + contribution);
    }

    return totals;
  },
};
