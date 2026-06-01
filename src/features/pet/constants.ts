import { PetMood, PetStage, type PetMoodValue, type PetStageValue } from '@/types/pet';

export const PET_XP_REWARDS = {
  DAILY_MISSION: 10,
  WEEKLY_MISSION: 50,
  CONTRACT: 100,
  ACHIEVEMENT: 25,
} as const;

export const STAGE_EVOLUTION_REWARDS: Record<
  Exclude<PetStageValue, typeof PetStage.EGG>,
  { coins: number; label: string }
> = {
  [PetStage.BABY]: { coins: 100, label: 'Baby' },
  [PetStage.TEEN]: { coins: 250, label: 'Teen' },
  [PetStage.ADULT]: { coins: 500, label: 'Adult' },
  [PetStage.LEGENDARY]: { coins: 1000, label: 'Legendary' },
};

export const STAGE_ORDER: PetStageValue[] = [
  PetStage.EGG,
  PetStage.BABY,
  PetStage.TEEN,
  PetStage.ADULT,
  PetStage.LEGENDARY,
];

export const STAGE_CONFIG: Record<
  PetStageValue,
  { emoji: string; label: string; minLevel: number }
> = {
  [PetStage.EGG]: { emoji: '🥚', label: 'Ovo', minLevel: 1 },
  [PetStage.BABY]: { emoji: '🐣', label: 'Filhote', minLevel: 5 },
  [PetStage.TEEN]: { emoji: '🐥', label: 'Jovem', minLevel: 10 },
  [PetStage.ADULT]: { emoji: '🐦', label: 'Adulto', minLevel: 20 },
  [PetStage.LEGENDARY]: { emoji: '🦅', label: 'Lendário', minLevel: 50 },
};

export const MOOD_CONFIG: Record<
  PetMoodValue,
  { emoji: string; message: string; label: string }
> = {
  [PetMood.VERY_SAD]: {
    emoji: '😢',
    message: 'Sinto falta dos nossos estudos...',
    label: 'Muito triste',
  },
  [PetMood.SAD]: {
    emoji: '🙁',
    message: 'Vamos estudar hoje?',
    label: 'Triste',
  },
  [PetMood.NORMAL]: {
    emoji: '🙂',
    message: 'Bom trabalho.',
    label: 'Normal',
  },
  [PetMood.HAPPY]: {
    emoji: '😄',
    message: 'Estamos evoluindo!',
    label: 'Feliz',
  },
  [PetMood.VERY_HAPPY]: {
    emoji: '🤩',
    message: 'Você é imparável!',
    label: 'Muito feliz',
  },
};

export const PET_NOTIFICATION_MESSAGES = {
  userAbsent: 'Seu pet sente sua falta.',
  streakAtRisk: 'Seu pet está esperando a lição de hoje.',
  lowMood: 'Seu pet está ficando triste.',
} as const;

/** Minimum wait between any pet interactions (vitais exigem cuidados mais frequentes). */
export const PET_INTERACTION_COOLDOWN_MS = 5 * 60 * 1000;
