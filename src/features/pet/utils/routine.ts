import { PetAnimationCategory } from '@/types/pet-expansion';
import { PetMood, type PetMoodValue } from '@/types/pet';
import { PetRoutinePhase, type PetRoutinePhaseValue } from '@/types/pet-expansion';

import { PET_VITAL_DECAY } from '../constants/vitals';

export const getRoutinePhase = (date = new Date()): PetRoutinePhaseValue => {
  const hour = date.getHours();
  if (hour >= 6 && hour < 12) return PetRoutinePhase.MORNING;
  if (hour >= 12 && hour < 18) return PetRoutinePhase.AFTERNOON;
  if (hour >= 18 && hour < 22) return PetRoutinePhase.EVENING;
  if (hour >= 22 || hour < 6) return PetRoutinePhase.SLEEPING;
  return PetRoutinePhase.NIGHT;
};

export const ROUTINE_LABELS: Record<PetRoutinePhaseValue, { label: string; emoji: string }> = {
  [PetRoutinePhase.MORNING]: { label: 'Manhã', emoji: '🌅' },
  [PetRoutinePhase.AFTERNOON]: { label: 'Tarde', emoji: '☀️' },
  [PetRoutinePhase.EVENING]: { label: 'Noite', emoji: '🌆' },
  [PetRoutinePhase.NIGHT]: { label: 'Madrugada', emoji: '🌙' },
  [PetRoutinePhase.SLEEPING]: { label: 'Dormindo', emoji: '💤' },
};

export const moodToAnimationCategory = (
  mood: PetMoodValue,
): (typeof PetAnimationCategory)[keyof typeof PetAnimationCategory] => {
  if (mood === PetMood.VERY_HAPPY || mood === PetMood.HAPPY) return PetAnimationCategory.HAPPY;
  if (mood === PetMood.VERY_SAD || mood === PetMood.SAD) return PetAnimationCategory.SAD;
  return PetAnimationCategory.IDLE;
};

type VitalPetSlice = {
  energy: number;
  hunger: number;
  happiness: number;
  motivation: number;
  lastInteractionAt: string | null;
  updatedAt: string;
};

const lastVitalTickMs = (pet: VitalPetSlice, now: number): number => {
  const updated = new Date(pet.updatedAt).getTime();
  const interacted = pet.lastInteractionAt ? new Date(pet.lastInteractionAt).getTime() : 0;
  const base = Math.max(updated, interacted);
  return Number.isFinite(base) ? base : now;
};

/** Decai vitais com base no tempo offline; recupera energia enquanto dorme. */
export const applyVitalDecay = (
  pet: VitalPetSlice,
  now = Date.now(),
): Pick<VitalPetSlice, 'energy' | 'hunger' | 'happiness' | 'motivation'> => {
  const lastAt = lastVitalTickMs(pet, now);
  const hoursElapsed = Math.max(0, (now - lastAt) / (1000 * 60 * 60));
  const steps = Math.min(
    Math.floor(hoursElapsed * 2),
    PET_VITAL_DECAY.MAX_STEPS_PER_SYNC,
  );

  if (steps <= 0) {
    return {
      energy: pet.energy,
      hunger: pet.hunger,
      happiness: pet.happiness,
      motivation: pet.motivation,
    };
  }

  const phase = getRoutinePhase(new Date(now));
  const isSleeping = phase === PetRoutinePhase.SLEEPING;

  let energy = pet.energy;
  if (isSleeping) {
    energy += steps * PET_VITAL_DECAY.SLEEP_ENERGY_RECOVERY_PER_STEP;
  } else {
    energy -= steps * PET_VITAL_DECAY.ENERGY_PER_STEP;
  }

  let hunger = pet.hunger - steps * PET_VITAL_DECAY.HUNGER_PER_STEP;
  let happiness = pet.happiness - steps * PET_VITAL_DECAY.HAPPINESS_PER_STEP;
  let motivation = pet.motivation - steps * PET_VITAL_DECAY.MOTIVATION_PER_STEP;

  if (hunger < 40 || energy < 35) {
    happiness -= Math.min(steps, 3);
    motivation -= Math.min(steps, 2);
  }

  return {
    energy: Math.max(0, Math.min(100, Math.round(energy))),
    hunger: Math.max(0, Math.min(100, Math.round(hunger))),
    happiness: Math.max(0, Math.min(100, Math.round(happiness))),
    motivation: Math.max(0, Math.min(100, Math.round(motivation))),
  };
};
