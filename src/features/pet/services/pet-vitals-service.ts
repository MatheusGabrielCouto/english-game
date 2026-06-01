import { PetInteractionType, type PetInteractionTypeValue } from '@/types/pet-expansion';
import type { Pet } from '@/types/pet';

import { PET_VITAL_THRESHOLDS } from '../constants/vitals';
import { clampVital } from '../utils/affinity';

export type PetVitalBlockReason =
  | 'hunger_low'
  | 'energy_low'
  | 'already_fed'
  | null;

export const PetVitalsService = {
  getHungerLabel(): string {
    return 'Alimentação';
  },

  isCriticallyLow(pet: Pet): boolean {
    return (
      pet.hunger <= PET_VITAL_THRESHOLDS.CRITICAL ||
      pet.energy <= PET_VITAL_THRESHOLDS.CRITICAL
    );
  },

  isLow(pet: Pet): boolean {
    return (
      pet.hunger <= PET_VITAL_THRESHOLDS.LOW_WARNING ||
      pet.energy <= PET_VITAL_THRESHOLDS.LOW_WARNING
    );
  },

  getBlockReason(pet: Pet, type: PetInteractionTypeValue): PetVitalBlockReason {
    if (type === PetInteractionType.FEED) {
      if (pet.hunger >= PET_VITAL_THRESHOLDS.FEED_ALREADY_FULL) return 'already_fed';
      return null;
    }

    const minHunger =
      type === PetInteractionType.TRAIN
        ? PET_VITAL_THRESHOLDS.MIN_HUNGER_TO_TRAIN
        : type === PetInteractionType.PLAY
          ? PET_VITAL_THRESHOLDS.MIN_HUNGER_TO_PLAY
          : PET_VITAL_THRESHOLDS.MIN_HUNGER_TO_INTERACT;

    const minEnergy =
      type === PetInteractionType.TRAIN
        ? PET_VITAL_THRESHOLDS.MIN_ENERGY_TO_TRAIN
        : type === PetInteractionType.PLAY
          ? PET_VITAL_THRESHOLDS.MIN_ENERGY_TO_PLAY
          : PET_VITAL_THRESHOLDS.MIN_ENERGY_TO_INTERACT;

    if (pet.hunger < minHunger) return 'hunger_low';
    if (pet.energy < minEnergy) return 'energy_low';

    return null;
  },

  canInteract(pet: Pet, type: PetInteractionTypeValue): boolean {
    return PetVitalsService.getBlockReason(pet, type) === null;
  },

  getBlockMessage(pet: Pet, type: PetInteractionTypeValue): string | null {
    const reason = PetVitalsService.getBlockReason(pet, type);
    if (!reason) return null;

    if (reason === 'already_fed') {
      return `${pet.name} já está bem alimentado. Tente brincar ou treinar!`;
    }
    if (reason === 'hunger_low') {
      return `${pet.name} está com fome. Alimente antes de ${type === PetInteractionType.TRAIN ? 'treinar' : 'brincar'}.`;
    }
    if (reason === 'energy_low') {
      return `${pet.name} está cansado. Deixe descansar ou alimente para recuperar energia.`;
    }
    return null;
  },

  applyBonuses(
    pet: Pick<Pet, 'hunger' | 'energy' | 'happiness' | 'motivation'>,
    bonus: Partial<Pick<Pet, 'hunger' | 'energy' | 'happiness' | 'motivation'>>,
  ): Pick<Pet, 'hunger' | 'energy' | 'happiness' | 'motivation'> {
    return {
      hunger: clampVital(pet.hunger + (bonus.hunger ?? 0)),
      energy: clampVital(pet.energy + (bonus.energy ?? 0)),
      happiness: clampVital(pet.happiness + (bonus.happiness ?? 0)),
      motivation: clampVital(pet.motivation + (bonus.motivation ?? 0)),
    };
  },

  /** Reduz ganhos de afinidade quando vitais estão baixos. */
  getAffinityMultiplier(pet: Pet): number {
    const avg = (pet.hunger + pet.energy + pet.happiness) / 3;
    if (avg >= 70) return 1;
    if (avg >= 45) return 0.85;
    if (avg >= 25) return 0.65;
    return 0.45;
  },
};
