import type {
    PetAdventureBiomeKey,
    PetAdventureDurationKey,
    PetAdventureSlotGroup,
} from '@/types/pet-adventure';
import type { PetInstance } from '@/types/pet-instance';
import { PET_STAT_KEYS } from '@/types/pet-instance';

export type PetAdventureBiomeDef = {
  key: PetAdventureBiomeKey;
  label: string;
  emoji: string;
  description: string;
  successMod: number;
  minLevel: number;
  minGeneration: number;
  requiresLeagueGold?: boolean;
  primaryReward: 'coins' | 'loot' | 'sp' | 'breed' | 'relic' | 'cosmetic';
};

export type PetAdventureDurationDef = {
  key: PetAdventureDurationKey;
  label: string;
  minutes: number;
  slotGroup: PetAdventureSlotGroup;
  coinsMin: number;
  coinsMax: number;
  petXp: number;
  studyPointsMin?: number;
  studyPointsMax?: number;
  lootOnSuccess?: boolean;
  countsForWeekly24hCap?: boolean;
};

export const PET_ADVENTURE_SHORT_SLOT_BASE = 2;
export const PET_ADVENTURE_LONG_SLOT_BASE = 1;
export const PET_ADVENTURE_WEEKLY_24H_CAP = 3;
export const PET_ADVENTURE_PARTIAL_REWARD_RATIO = 0.5;

export const PET_ADVENTURE_DURATIONS: PetAdventureDurationDef[] = [
  { key: '15m', label: '15 min', minutes: 15, slotGroup: 'short', coinsMin: 15, coinsMax: 30, petXp: 5 },
  { key: '30m', label: '30 min', minutes: 30, slotGroup: 'short', coinsMin: 25, coinsMax: 45, petXp: 10 },
  { key: '1h', label: '1 h', minutes: 60, slotGroup: 'short', coinsMin: 80, coinsMax: 120, petXp: 25 },
  { key: '2h', label: '2 h', minutes: 120, slotGroup: 'short', coinsMin: 140, coinsMax: 200, petXp: 45 },
  { key: '4h', label: '4 h', minutes: 240, slotGroup: 'short', coinsMin: 220, coinsMax: 320, petXp: 70 },
  {
    key: '8h',
    label: '8 h',
    minutes: 480,
    slotGroup: 'long',
    coinsMin: 400,
    coinsMax: 600,
    petXp: 120,
    lootOnSuccess: true,
  },
  {
    key: '12h',
    label: '12 h',
    minutes: 720,
    slotGroup: 'long',
    coinsMin: 550,
    coinsMax: 750,
    petXp: 180,
    lootOnSuccess: true,
  },
  {
    key: '24h',
    label: '24 h',
    minutes: 1440,
    slotGroup: 'long',
    coinsMin: 900,
    coinsMax: 1400,
    petXp: 300,
    lootOnSuccess: true,
    countsForWeekly24hCap: true,
  },
];

export const PET_ADVENTURE_BIOMES: PetAdventureBiomeDef[] = [
  {
    key: 'meadow',
    label: 'Prado',
    emoji: '🌾',
    description: 'Moedas estáveis',
    successMod: 0.05,
    minLevel: 1,
    minGeneration: 1,
    primaryReward: 'coins',
  },
  {
    key: 'cave',
    label: 'Caverna',
    emoji: '🪨',
    description: 'Loot box comum',
    successMod: 0,
    minLevel: 5,
    minGeneration: 1,
    primaryReward: 'loot',
  },
  {
    key: 'shore',
    label: 'Costa',
    emoji: '🌊',
    description: 'Study Points',
    successMod: -0.02,
    minLevel: 8,
    minGeneration: 1,
    primaryReward: 'sp',
  },
  {
    key: 'summit',
    label: 'Cume',
    emoji: '⛰️',
    description: 'Bônus de breeding',
    successMod: -0.05,
    minLevel: 10,
    minGeneration: 3,
    primaryReward: 'breed',
  },
  {
    key: 'ruins',
    label: 'Ruínas',
    emoji: '🏛️',
    description: 'Moedas + chance relíquia',
    successMod: -0.08,
    minLevel: 15,
    minGeneration: 10,
    primaryReward: 'relic',
  },
  {
    key: 'sky_isle',
    label: 'Ilha do Céu',
    emoji: '☁️',
    description: 'Cosmético raro (Liga Ouro)',
    successMod: 0,
    minLevel: 20,
    minGeneration: 5,
    requiresLeagueGold: true,
    primaryReward: 'cosmetic',
  },
];

export const PET_ADVENTURE_DURATION_BY_KEY = Object.fromEntries(
  PET_ADVENTURE_DURATIONS.map((d) => [d.key, d]),
) as Record<PetAdventureDurationKey, PetAdventureDurationDef>;

export const PET_ADVENTURE_BIOME_BY_KEY = Object.fromEntries(
  PET_ADVENTURE_BIOMES.map((b) => [b.key, b]),
) as Record<PetAdventureBiomeKey, PetAdventureBiomeDef>;

export const averagePetStat = (stats: PetInstance['stats']): number => {
  const sum = PET_STAT_KEYS.reduce((acc, key) => acc + (stats[key] ?? 0), 0);
  return sum / PET_STAT_KEYS.length;
};

export const adventureTraitSuccessBonus = (traitKeys: string[]): number => {
  let bonus = 0;
  if (traitKeys.includes('adventurer')) bonus += 0.1;
  if (traitKeys.includes('shy')) bonus -= 0.05;
  return bonus;
};

export const computeAdventureSuccessChance = (
  instance: PetInstance,
  biomeKey: PetAdventureBiomeKey,
): number => {
  const biome = PET_ADVENTURE_BIOME_BY_KEY[biomeKey];
  const avg = averagePetStat(instance.stats);
  const raw =
    0.45 +
    instance.level * 0.008 +
    avg / 200 +
    instance.generation * 0.005 +
    adventureTraitSuccessBonus(instance.traitKeys) +
    (biome?.successMod ?? 0);

  return Math.min(0.95, Math.max(0.35, raw));
};

export const isBiomeUnlocked = (
  instance: PetInstance,
  biome: PetAdventureBiomeDef,
  leagueGoldUnlocked: boolean,
): { ok: boolean; reason?: string } => {
  if (biome.requiresLeagueGold && !leagueGoldUnlocked) {
    return { ok: false, reason: 'Alcance Liga Ouro nesta temporada.' };
  }
  if (instance.level < biome.minLevel) {
    return { ok: false, reason: `Nível ${biome.minLevel}+ necessário.` };
  }
  if (instance.generation < biome.minGeneration) {
    return { ok: false, reason: `GEN ${biome.minGeneration}+ necessário.` };
  }
  return { ok: true };
};

export const rollCoinsInRange = (min: number, max: number): number =>
  min + Math.floor(Math.random() * (max - min + 1));

export const rollStudyPointsForShore = (duration: PetAdventureDurationDef): number => {
  const min = duration.studyPointsMin ?? Math.max(3, Math.round(duration.petXp * 0.4));
  const max = duration.studyPointsMax ?? Math.max(min + 2, Math.round(duration.petXp * 0.7));
  return rollCoinsInRange(min, max);
};
