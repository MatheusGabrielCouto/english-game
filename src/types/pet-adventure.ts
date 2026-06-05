export const PetAdventureBiome = {
  MEADOW: 'meadow',
  CAVE: 'cave',
  SHORE: 'shore',
  SUMMIT: 'summit',
  RUINS: 'ruins',
  SKY_ISLE: 'sky_isle',
} as const;

export type PetAdventureBiomeKey = (typeof PetAdventureBiome)[keyof typeof PetAdventureBiome];

export const PetAdventureDuration = {
  M15: '15m',
  M30: '30m',
  H1: '1h',
  H2: '2h',
  H4: '4h',
  H8: '8h',
  H12: '12h',
  H24: '24h',
} as const;

export type PetAdventureDurationKey = (typeof PetAdventureDuration)[keyof typeof PetAdventureDuration];

export type PetAdventureSlotGroup = 'short' | 'long';

export type PetAdventureEntry = {
  id: number;
  instanceId: number;
  biomeKey: PetAdventureBiomeKey;
  durationKey: PetAdventureDurationKey;
  startedAt: string;
  endsAt: string;
  createdAt: string;
};

export type PetAdventureClaimResult = {
  adventureId: number;
  instanceId: number;
  success: boolean;
  partial: boolean;
  coins: number;
  petXp: number;
  studyPoints: number;
  lootGranted: boolean;
  flavor: string;
};
