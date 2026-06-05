import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';

import {
    PetTraitBonusService,
    type AggregatedTraitBonuses,
} from './pet-trait-bonus-service';

const EMPTY: AggregatedTraitBonuses = {
  xp_percent: 0,
  coin_percent: 0,
  loot_percent: 0,
  contract_percent: 0,
  labels: [],
};

let cached: AggregatedTraitBonuses = EMPTY;

export const PetTraitBonusCache = {
  getSync(): AggregatedTraitBonuses {
    return cached;
  },

  async refresh(): Promise<AggregatedTraitBonuses> {
    const active = await PetInstanceRepository.findActive();
    cached = active
      ? PetTraitBonusService.aggregateFromTraitKeys(active.traitKeys)
      : EMPTY;
    return cached;
  },

  reset(): void {
    cached = EMPTY;
  },
};
