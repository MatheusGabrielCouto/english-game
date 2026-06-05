import type { PetAcademyTrackKey } from '@/types/pet-academy';
import type { PetStatKeyValue } from '@/types/pet-instance';

export type PetAcademyTrackDef = {
  key: PetAcademyTrackKey;
  label: string;
  emoji: string;
  description: string;
  minutes: number;
  statKey: PetStatKeyValue;
  petXp: number;
};

export const PET_ACADEMY_MAX_CONCURRENT = 2;
export const PET_ACADEMY_STAT_GAIN_MIN = 1;
export const PET_ACADEMY_STAT_GAIN_MAX = 3;
export const PET_ACADEMY_TRAIT_ROLL_CHANCE = 0.05;
export const PET_ACADEMY_ACE_XP_BONUS = 0.15;
export const PET_ACADEMY_MENTOR_STAT_BONUS = 0.05;

/** Traits que podem surgir ao concluir sessão (academy_ace não rerrola se já tiver). */
export const PET_ACADEMY_BONUS_TRAIT_KEYS = ['academy_ace', 'mentor_spirit'] as const;

export const PET_ACADEMY_TRACKS: PetAcademyTrackDef[] = [
  {
    key: 'vocabulary',
    label: 'Vocabulário',
    emoji: '📚',
    description: 'Amplia vocabulário e foco',
    minutes: 120,
    statKey: 'focus',
    petXp: 40,
  },
  {
    key: 'grammar',
    label: 'Gramática',
    emoji: '📝',
    description: 'Disciplina e foco',
    minutes: 120,
    statKey: 'focus',
    petXp: 40,
  },
  {
    key: 'listening',
    label: 'Listening',
    emoji: '🎧',
    description: 'Sorte e percepção',
    minutes: 120,
    statKey: 'luck',
    petXp: 40,
  },
  {
    key: 'speaking',
    label: 'Speaking',
    emoji: '🗣️',
    description: 'Carisma e expressão',
    minutes: 180,
    statKey: 'charm',
    petXp: 55,
  },
  {
    key: 'career',
    label: 'Carreira',
    emoji: '💼',
    description: 'Força e constância',
    minutes: 240,
    statKey: 'strength',
    petXp: 70,
  },
];

export const PET_ACADEMY_TRACK_BY_KEY = Object.fromEntries(
  PET_ACADEMY_TRACKS.map((t) => [t.key, t]),
) as Record<PetAcademyTrackKey, PetAcademyTrackDef>;
