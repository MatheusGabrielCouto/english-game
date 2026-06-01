export const PetStage = {
  EGG: 'egg',
  BABY: 'baby',
  TEEN: 'teen',
  ADULT: 'adult',
  LEGENDARY: 'legendary',
} as const;

export type PetStageValue = (typeof PetStage)[keyof typeof PetStage];

export const PetMood = {
  VERY_SAD: 'very_sad',
  SAD: 'sad',
  NORMAL: 'normal',
  HAPPY: 'happy',
  VERY_HAPPY: 'very_happy',
} as const;

export type PetMoodValue = (typeof PetMood)[keyof typeof PetMood];

export const PetRarity = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary',
} as const;

export type PetRarityValue = (typeof PetRarity)[keyof typeof PetRarity];

export type Pet = {
  id: number;
  stage: PetStageValue;
  mood: PetMoodValue;
  experience: number;
  level: number;
  createdAt: string;
  updatedAt: string;
  speciesKey: string;
  name: string;
  energy: number;
  hunger: number;
  happiness: number;
  motivation: number;
  affinity: number;
  isIncubating: boolean;
  hatchAt: string | null;
  equippedCosmeticsJson: string;
  lastInteractionAt: string | null;
  routinePhase: string;
  currentAnimationKey: string;
};

export type PetAnalyticsRecord = {
  currentLevel: number;
  currentStage: PetStageValue;
  totalEvolutions: number;
  totalExperienceGained: number;
  positiveMoodDays: number;
  negativeMoodDays: number;
  lastMoodRecordDate: string | null;
};

export type PetXPProgress = {
  current: number;
  required: number;
  percentage: number;
};

export type PetEvolutionReward = {
  stage: PetStageValue;
  coins: number;
  label: string;
};
