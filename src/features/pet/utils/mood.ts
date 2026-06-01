import { PetMood, type PetMoodValue } from '@/types/pet';

export const resolveMoodFromStreak = (currentStreak: number): PetMoodValue => {
  if (currentStreak === 0) return PetMood.VERY_SAD;
  if (currentStreak <= 2) return PetMood.SAD;
  if (currentStreak <= 6) return PetMood.NORMAL;
  if (currentStreak <= 14) return PetMood.HAPPY;
  return PetMood.VERY_HAPPY;
};

export const isPositiveMood = (mood: PetMoodValue): boolean =>
  mood === PetMood.HAPPY || mood === PetMood.VERY_HAPPY;

export const isNegativeMood = (mood: PetMoodValue): boolean =>
  mood === PetMood.VERY_SAD || mood === PetMood.SAD;
