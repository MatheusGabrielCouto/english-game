import { PET_XP_PER_LEVEL } from '@/features/game-design/constants/balance';
import { PetStage, type PetStageValue, type PetXPProgress } from '@/types/pet';

export const getRequiredPetXP = (level: number): number => level * PET_XP_PER_LEVEL;

export const getPetXPProgress = (level: number, experience: number): PetXPProgress => {
  const required = getRequiredPetXP(level);
  const percentage = required > 0 ? Math.min(100, (experience / required) * 100) : 0;

  return { current: experience, required, percentage };
};

export const resolveStageFromLevel = (level: number): PetStageValue => {
  if (level >= 50) return PetStage.LEGENDARY;
  if (level >= 20) return PetStage.ADULT;
  if (level >= 10) return PetStage.TEEN;
  if (level >= 5) return PetStage.BABY;
  return PetStage.EGG;
};

export const getNextStage = (currentStage: PetStageValue): PetStageValue | null => {
  const order = [
    PetStage.EGG,
    PetStage.BABY,
    PetStage.TEEN,
    PetStage.ADULT,
    PetStage.LEGENDARY,
  ];
  const index = order.indexOf(currentStage);
  return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
};

export type PetLevelUpResult = {
  level: number;
  experience: number;
  levelsGained: number;
};

export const applyPetExperience = (
  level: number,
  experience: number,
  amount: number,
): PetLevelUpResult => {
  let currentLevel = level;
  let currentExperience = experience + amount;
  let levelsGained = 0;

  let required = getRequiredPetXP(currentLevel);

  while (currentExperience >= required) {
    currentExperience -= required;
    currentLevel += 1;
    levelsGained += 1;
    required = getRequiredPetXP(currentLevel);
  }

  return {
    level: currentLevel,
    experience: currentExperience,
    levelsGained,
  };
};

/** Fixes overflow XP when level and experience drift out of sync (e.g. concurrent saves). */
export const normalizePetExperience = (level: number, experience: number): PetLevelUpResult =>
  applyPetExperience(level, experience, 0);
