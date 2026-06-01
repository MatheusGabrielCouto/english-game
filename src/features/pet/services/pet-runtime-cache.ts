import type { Pet } from '@/types/pet';

/** Sync pet snapshot for modules that must not import PetService (avoids require cycles). */
let cachedPet: Pet | null = null;

export const PetRuntimeCache = {
  get(): Pet | null {
    return cachedPet;
  },

  set(pet: Pet | null): void {
    cachedPet = pet;
  },
};
