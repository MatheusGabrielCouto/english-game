import { ALL_PET_SPECIES } from '@/features/pet-farm/catalogs/pet-species-resolver';
import { PetRarity, type PetRarityValue } from '@/types/pet';
import type { PetInstance } from '@/types/pet-instance';
import {
    PetLeagueDivision,
    type PetLeagueDivisionValue,
    type PetLeagueGhost,
    type PetLeagueRewardTierValue,
} from '@/types/pet-league';

import { PET_STAT_KEYS } from '@/types/pet-instance';

export const PET_LEAGUE_STAR_TRAIT_BONUS = 20;
export const PET_LEAGUE_BATTLES_PER_PET_DAY = 5;
export const PET_LEAGUE_GHOST_COUNT = 5;

export type PetLeagueDivisionDef = {
  key: PetLeagueDivisionValue;
  label: string;
  emoji: string;
  poolRarities: PetRarityValue[];
};

export const PET_LEAGUE_DIVISIONS: PetLeagueDivisionDef[] = [
  {
    key: PetLeagueDivision.COMMON,
    label: 'Liga Comum',
    emoji: '🥉',
    poolRarities: [PetRarity.COMMON],
  },
  {
    key: PetLeagueDivision.RARE,
    label: 'Liga Rara',
    emoji: '💎',
    poolRarities: [PetRarity.RARE],
  },
  {
    key: PetLeagueDivision.EPIC,
    label: 'Liga Épica',
    emoji: '🔮',
    poolRarities: [PetRarity.EPIC],
  },
  {
    key: PetLeagueDivision.LEGEND,
    label: 'Liga Lendária',
    emoji: '👑',
    poolRarities: [PetRarity.LEGENDARY],
  },
];

export const PET_LEAGUE_DIVISION_BY_KEY = Object.fromEntries(
  PET_LEAGUE_DIVISIONS.map((d) => [d.key, d]),
) as Record<PetLeagueDivisionValue, PetLeagueDivisionDef>;

export type PetLeagueRewardTierDef = {
  key: PetLeagueRewardTierValue;
  label: string;
  emoji: string;
  minWins: number;
  minPeakRating: number;
  coins: number;
  studyPoints: number;
  extrasLabel: string;
};

export const PET_LEAGUE_REWARD_TIERS: PetLeagueRewardTierDef[] = [
  {
    key: 'bronze',
    label: 'Bronze',
    emoji: '🥉',
    minWins: 3,
    minPeakRating: 120,
    coins: 200,
    studyPoints: 50,
    extrasLabel: '—',
  },
  {
    key: 'silver',
    label: 'Prata',
    emoji: '🥈',
    minWins: 7,
    minPeakRating: 280,
    coins: 500,
    studyPoints: 120,
    extrasLabel: 'Cosmético raro',
  },
  {
    key: 'gold',
    label: 'Ouro',
    emoji: '🥇',
    minWins: 12,
    minPeakRating: 420,
    coins: 1200,
    studyPoints: 300,
    extrasLabel: 'Título + moldura · Ilha do Céu',
  },
  {
    key: 'champion',
    label: 'Campeão',
    emoji: '🏆',
    minWins: 20,
    minPeakRating: 600,
    coins: 2500,
    studyPoints: 600,
    extrasLabel: 'Recompensa máxima da temporada',
  },
];

export const PET_LEAGUE_REWARD_BY_KEY = Object.fromEntries(
  PET_LEAGUE_REWARD_TIERS.map((t) => [t.key, t]),
) as Record<PetLeagueRewardTierValue, PetLeagueRewardTierDef>;

const RARITY_TO_DIVISION: Record<PetRarityValue, PetLeagueDivisionValue> = {
  [PetRarity.COMMON]: PetLeagueDivision.COMMON,
  [PetRarity.RARE]: PetLeagueDivision.RARE,
  [PetRarity.EPIC]: PetLeagueDivision.EPIC,
  [PetRarity.LEGENDARY]: PetLeagueDivision.LEGEND,
};

export const resolveLeagueDivision = (speciesRarity: PetRarityValue): PetLeagueDivisionValue =>
  RARITY_TO_DIVISION[speciesRarity] ?? PetLeagueDivision.COMMON;

export const computeLeagueTraitScore = (traitKeys: string[]): number =>
  traitKeys.includes('league_star') ? PET_LEAGUE_STAR_TRAIT_BONUS : 0;

export const computeLeagueRating = (instance: PetInstance, winStreak: number): number => {
  const statSum = PET_STAT_KEYS.reduce((acc, key) => acc + (instance.stats[key] ?? 0), 0);
  const traitScore = computeLeagueTraitScore(instance.traitKeys);
  return Math.round(
    instance.level * 12 + statSum * 2 + instance.generation * 8 + traitScore + winStreak * 15,
  );
};

export const computeBattleWinChance = (playerRating: number, ghostRating: number): number => {
  const edge = (playerRating - ghostRating) / 400;
  return Math.min(0.85, Math.max(0.25, 0.5 + edge));
};

export const leagueWinCoins = (division: PetLeagueDivisionValue): number => {
  switch (division) {
    case PetLeagueDivision.LEGEND:
      return 45;
    case PetLeagueDivision.EPIC:
      return 38;
    case PetLeagueDivision.RARE:
      return 30;
    default:
      return 22;
  }
};

export const eligibleRewardTiers = (
  totalWins: number,
  peakRating: number,
): PetLeagueRewardTierValue[] =>
  PET_LEAGUE_REWARD_TIERS.filter(
    (t) => totalWins >= t.minWins || peakRating >= t.minPeakRating,
  ).map((t) => t.key);

const GHOST_NAMES = [
  'Sombra Veloz',
  'Eco Noturno',
  'Brisa Fantasma',
  'Eco de Bronze',
  'Vulto Dourado',
  'Névoa de Cristal',
  'Eco Lunar',
  'Sussurro de Vento',
];

const hashSeed = (input: string): number => {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const pickFromPool = <T>(pool: T[], seed: number, index: number): T =>
  pool[(seed + index * 17) % pool.length]!;

export const generateLeagueGhosts = (input: {
  seasonKey: string;
  instanceId: number;
  division: PetLeagueDivisionValue;
  playerRating: number;
}): PetLeagueGhost[] => {
  const def = PET_LEAGUE_DIVISION_BY_KEY[input.division];
  const pool = ALL_PET_SPECIES.filter((s) => def.poolRarities.includes(s.rarity));
  const speciesPool = pool.length > 0 ? pool : ALL_PET_SPECIES;
  const dayKey = new Date().toISOString().slice(0, 10);
  const baseSeed = hashSeed(`${input.seasonKey}:${input.instanceId}:${dayKey}:${input.division}`);

  return Array.from({ length: PET_LEAGUE_GHOST_COUNT }, (_, index) => {
    const species = pickFromPool(speciesPool, baseSeed, index);
    const ratingJitter = 0.85 + ((baseSeed + index * 7) % 31) / 100;
    const rating = Math.max(40, Math.round(input.playerRating * ratingJitter));
    const level = Math.max(1, Math.round(rating / 14));
    const name = pickFromPool(GHOST_NAMES, baseSeed + index, index);

    return {
      id: `ghost-${input.division}-${index}`,
      displayName: name,
      speciesKey: species.key,
      emoji: species.emoji,
      rating,
      level,
    };
  });
};
