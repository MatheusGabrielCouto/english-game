import { PET_STAT_KEYS } from '@/types/pet-instance';
import { PetHallCategoryKey, type PetHallCategoryKeyValue } from '@/types/pet-hall';

export type PetHallCategoryDef = {
  slot: number;
  key: PetHallCategoryKeyValue;
  label: string;
  emoji: string;
};

export const PET_HALL_CATEGORIES: PetHallCategoryDef[] = [
  { slot: 0, key: PetHallCategoryKey.HIGHEST_GEN, label: 'Maior Geração', emoji: '🧬' },
  { slot: 1, key: PetHallCategoryKey.HIGHEST_LEVEL, label: 'Maior Nível', emoji: '⬆️' },
  { slot: 2, key: PetHallCategoryKey.HIGHEST_STATS, label: 'Maior Soma Stats', emoji: '💪' },
  { slot: 3, key: PetHallCategoryKey.OLDEST, label: 'Mais Antigo', emoji: '📜' },
  { slot: 4, key: PetHallCategoryKey.MOST_ADVENTURES, label: 'Mais Aventuras', emoji: '🗺️' },
  { slot: 5, key: PetHallCategoryKey.MOST_LEAGUE_WINS, label: 'Mais Vitórias Liga', emoji: '🏆' },
];

export const PET_HALL_CATEGORY_BY_SLOT = Object.fromEntries(
  PET_HALL_CATEGORIES.map((c) => [c.slot, c]),
) as Record<number, PetHallCategoryDef>;

export const sumPetStats = (stats: Record<string, number>): number =>
  PET_STAT_KEYS.reduce((acc, key) => acc + (stats[key] ?? 0), 0);
