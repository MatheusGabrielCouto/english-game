export const PetInteractionType = {
  PET: 'pet',
  FEED: 'feed',
  PLAY: 'play',
  TALK: 'talk',
  TRAIN: 'train',
  GIFT: 'gift',
  PHOTO: 'photo',
  ACCESSORY: 'accessory',
} as const;

export type PetInteractionTypeValue = (typeof PetInteractionType)[keyof typeof PetInteractionType];

export const PetRoutinePhase = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
  NIGHT: 'night',
  SLEEPING: 'sleeping',
} as const;

export type PetRoutinePhaseValue = (typeof PetRoutinePhase)[keyof typeof PetRoutinePhase];

export const PetAnimationCategory = {
  IDLE: 'idle',
  HAPPY: 'happy',
  SAD: 'sad',
  EXCITED: 'excited',
} as const;

export type PetAnimationCategoryValue =
  (typeof PetAnimationCategory)[keyof typeof PetAnimationCategory];

export type PetAnimationDefinition = {
  key: string;
  label: string;
  category: PetAnimationCategoryValue;
  mood: string;
  emoji: string;
  minAffinity: number;
};

export type PetFoodDefinition = {
  key: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  hungerRestore: number;
  energyRestore: number;
  happinessBoost: number;
  affinityGain: number;
  effectLabel: string;
};

export type PetToyDefinition = {
  key: string;
  name: string;
  icon: string;
  animationKey: string;
  affinityGain: number;
  energyCost: number;
  happinessBoost: number;
};

export type PetCosmeticSlot = 'hat' | 'glasses' | 'backpack' | 'outfit' | 'skin';

export type PetCosmeticDefinition = {
  key: string;
  name: string;
  icon: string;
  slot: PetCosmeticSlot;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  minStage: string;
};

export type PetDialogueContext =
  | 'greeting'
  | 'streak'
  | 'xp'
  | 'mood_happy'
  | 'mood_sad'
  | 'mission'
  | 'evolution'
  | 'affinity'
  | 'routine'
  | 'english_practice';

export type PetDialogueLine = {
  key: string;
  context: PetDialogueContext;
  text: string;
  minAffinity: number;
};

export type PetMemoryDefinition = {
  key: string;
  title: string;
  description: string;
  icon: string;
  eventType: string;
};

export type PetEquippedCosmetics = Partial<Record<PetCosmeticSlot, string>>;

export type PetMemoryRecord = {
  memoryKey: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
};

export type PetInteractionResult = {
  success: boolean;
  affinityGain: number;
  animationKey: string;
  dialogueKey?: string;
  message: string;
  cooldownRemainingMs?: number;
};
