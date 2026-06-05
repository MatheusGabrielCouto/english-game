export const PetLeagueDivision = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGEND: 'legend',
} as const;

export type PetLeagueDivisionValue = (typeof PetLeagueDivision)[keyof typeof PetLeagueDivision];

export const PetLeagueRewardTier = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  CHAMPION: 'champion',
} as const;

export type PetLeagueRewardTierValue = (typeof PetLeagueRewardTier)[keyof typeof PetLeagueRewardTier];

export type PetLeagueEntry = {
  id: number;
  instanceId: number;
  seasonKey: string;
  division: PetLeagueDivisionValue;
  wins: number;
  losses: number;
  winStreak: number;
  peakRating: number;
  battlesToday: number;
  battlesDayIso: string | null;
  lastBattleAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PetLeagueMeta = {
  id: number;
  seasonKey: string;
  seasonStartIso: string;
  claimedRewardTiers: PetLeagueRewardTierValue[];
  updatedAt: string;
};

export type PetLeagueGhost = {
  id: string;
  displayName: string;
  speciesKey: string;
  emoji: string;
  rating: number;
  level: number;
};

export type PetLeagueSeasonInfo = {
  seasonKey: string;
  seasonStartIso: string;
  seasonEndIso: string;
  daysRemaining: number;
};

export type PetLeagueBattleResult = {
  won: boolean;
  playerRating: number;
  ghostRating: number;
  winChance: number;
  coinsEarned: number;
  wins: number;
  losses: number;
  winStreak: number;
  peakRating: number;
};

export type PetLeagueSeasonProgress = {
  totalWins: number;
  peakRating: number;
  eligibleTiers: PetLeagueRewardTierValue[];
  claimedTiers: PetLeagueRewardTierValue[];
};
