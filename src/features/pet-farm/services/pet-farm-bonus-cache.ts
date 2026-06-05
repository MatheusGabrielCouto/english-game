import type { AggregatedFarmBonuses } from './pet-farm-bonus-service';
import { PetFarmBonusService } from './pet-farm-bonus-service';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';

export type PetFarmBonusCacheState = {
  pasture: AggregatedFarmBonuses;
  companionXp: number;
  companionCoins: number;
  companionLoot: number;
  companionLabel: string | null;
};

const EMPTY_PASTURE: AggregatedFarmBonuses = {
  xp_boost: 0,
  coin_boost: 0,
  loot_luck: 0,
  shield_weekly: 0,
};

const EMPTY: PetFarmBonusCacheState = {
  pasture: EMPTY_PASTURE,
  companionXp: 0,
  companionCoins: 0,
  companionLoot: 0,
  companionLabel: null,
};

let cached: PetFarmBonusCacheState = EMPTY;

const companionBonusesFromInstance = async (): Promise<{
  xp: number;
  coins: number;
  loot: number;
  label: string | null;
}> => {
  const active = await PetInstanceRepository.findActive();
  if (!active) return { xp: 0, coins: 0, loot: 0, label: null };

  const species = getSpeciesDefinition(active.speciesKey);
  const value = Math.round(active.effectivePassiveValue);
  const label = `${active.nickname} · companheiro`;

  switch (species.passive.type) {
    case 'xp_boost':
      return { xp: value, coins: 0, loot: 0, label };
    case 'coin_boost':
      return { xp: 0, coins: value, loot: 0, label };
    case 'loot_luck':
      return { xp: 0, coins: 0, loot: value, label };
    default:
      return { xp: 0, coins: 0, loot: 0, label };
  }
};

export const PetFarmBonusCache = {
  getSync(): PetFarmBonusCacheState {
    return cached;
  },

  async refresh(): Promise<PetFarmBonusCacheState> {
    const pasture = await PetFarmBonusService.getAggregatedBonuses();
    const companion = await companionBonusesFromInstance();
    cached = {
      pasture,
      companionXp: companion.xp,
      companionCoins: companion.coins,
      companionLoot: companion.loot,
      companionLabel: companion.label,
    };
    return cached;
  },

  reset(): void {
    cached = EMPTY;
  },
};
