import { create } from 'zustand';

import type { PetAcademyEntry } from '@/types/pet-academy';
import type { PetAdventureEntry } from '@/types/pet-adventure';
import type { PetFarmFieldKey, PetIncubatorEntry, PetInstance } from '@/types/pet-instance';
import type { AggregatedFarmBonuses } from '../services/pet-farm-bonus-service';

type FarmSlot = { index: number; pet: PetInstance | null };

type PetFarmState = {
  isLoading: boolean;
  instances: PetInstance[];
  fields: Record<PetFarmFieldKey, number>;
  incubators: PetIncubatorEntry[];
  adventures: PetAdventureEntry[];
  academySessions: PetAcademyEntry[];
  bonuses: AggregatedFarmBonuses;
  slots: FarmSlot[];
  setSnapshot: (snapshot: {
    instances: PetInstance[];
    fields: Record<PetFarmFieldKey, number>;
    incubators: PetIncubatorEntry[];
    adventures: PetAdventureEntry[];
    academySessions: PetAcademyEntry[];
    bonuses: AggregatedFarmBonuses;
    slots: FarmSlot[];
  }) => void;
  setLoading: (value: boolean) => void;
};

export const usePetFarmStore = create<PetFarmState>((set) => ({
  isLoading: true,
  instances: [],
  fields: {
    passive_pasture: 1,
    breeding_pen: 1,
    incubator_room: 2,
    barn_storage: 12,
  },
  incubators: [],
  adventures: [],
  academySessions: [],
  bonuses: { xp_boost: 0, coin_boost: 0, loot_luck: 0, shield_weekly: 0 },
  slots: [],
  setSnapshot: (snapshot) => set({ ...snapshot, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
