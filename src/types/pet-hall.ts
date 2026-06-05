import type { PetInstance } from '@/types/pet-instance';

export const PetHallCategoryKey = {
  HIGHEST_GEN: 'highest_gen',
  HIGHEST_LEVEL: 'highest_level',
  HIGHEST_STATS: 'highest_stats',
  OLDEST: 'oldest',
  MOST_ADVENTURES: 'most_adventures',
  MOST_LEAGUE_WINS: 'most_league_wins',
} as const;

export type PetHallCategoryKeyValue = (typeof PetHallCategoryKey)[keyof typeof PetHallCategoryKey];

export type PetHallPedestal = {
  slot: number;
  categoryKey: PetHallCategoryKeyValue;
  categoryLabel: string;
  categoryEmoji: string;
  instance: PetInstance | null;
  suggestedInstance: PetInstance | null;
  metricLabel: string;
};

export const PET_HALL_SLOT_COUNT = 6;
