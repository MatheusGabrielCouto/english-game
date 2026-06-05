import type { PetStageValue } from '@/types/pet';
import type { PetEquippedCosmetics } from '@/types/pet-expansion';

export const PetFavoriteTag = {
  NONE: 'none',
  STAR: 'star',
  HEART: 'heart',
  CROWN: 'crown',
} as const;

export type PetFavoriteTagValue = (typeof PetFavoriteTag)[keyof typeof PetFavoriteTag];

export const PET_FAVORITE_TAG_ICONS: Record<PetFavoriteTagValue, string> = {
  none: '',
  star: '⭐',
  heart: '❤️',
  crown: '👑',
};

export const PetStatKey = {
  STRENGTH: 'strength',
  FOCUS: 'focus',
  LUCK: 'luck',
  RESILIENCE: 'resilience',
  CHARM: 'charm',
} as const;

export type PetStatKeyValue = (typeof PetStatKey)[keyof typeof PetStatKey];

export const PET_STAT_KEYS: PetStatKeyValue[] = [
  PetStatKey.STRENGTH,
  PetStatKey.FOCUS,
  PetStatKey.LUCK,
  PetStatKey.RESILIENCE,
  PetStatKey.CHARM,
];

export type PetInstanceStats = Record<PetStatKeyValue, number>;

export const PetGender = {
  FEMALE: 'female',
  MALE: 'male',
} as const;

export type PetGenderValue = (typeof PetGender)[keyof typeof PetGender];

export type PetIconLibrary = 'MaterialCommunityIcons' | 'Lucide';

export type PetIconRef = {
  library: PetIconLibrary;
  name: string;
};

export type PetInstance = {
  id: number;
  speciesKey: string;
  gender: PetGenderValue;
  nickname: string;
  stage: PetStageValue;
  level: number;
  experience: number;
  stats: PetInstanceStats;
  effectivePassiveValue: number;
  isActive: boolean;
  passiveFieldSlot: number | null;
  breedingPenSlot: number | null;
  parentMotherId: number | null;
  parentFatherId: number | null;
  generation: number;
  traitKeys: string[];
  personalityKey: string;
  breedingCooldownUntil: string | null;
  favoriteTag: PetFavoriteTagValue;
  hallOfFameSlot: number | null;
  totalAdventures: number;
  equippedCosmetics: PetEquippedCosmetics;
  createdAt: string;
  updatedAt: string;
};

export type PetFarmFieldKey =
  | 'passive_pasture'
  | 'breeding_pen'
  | 'incubator_room'
  | 'barn_storage';

export type PetIncubatorEntry = {
  id: number;
  speciesKey: string;
  source: 'shop' | 'breeding' | 'quest';
  hatchAt: string;
  parentMotherId: number | null;
  parentFatherId: number | null;
  predictedStatsJson: string | null;
  createdAt: string;
};
