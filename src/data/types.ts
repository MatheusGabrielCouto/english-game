import type { MissionCategoryValue, MissionDifficultyTierValue } from '@/features/game-design/constants/mission-types';
import type { WeeklyMissionType } from '@/types/weekly-mission-type';

export type ItemCategoryValue =
  | 'consumable'
  | 'booster'
  | 'ticket'
  | 'key'
  | 'relic';

export type ItemEffectType =
  | 'xp_boost'
  | 'coin_boost'
  | 'shield_repair'
  | 'timed_xp_percent'
  | 'timed_coin_percent'
  | 'timed_loot_luck'
  | 'timed_contract_percent'
  | 'double_xp'
  | 'double_coins'
  | 'quest_multiplier'
  | 'streak_protection'
  | 'free_loot'
  | 'unlock_loot'
  | 'passive_xp'
  | 'passive_coins'
  | 'flavor_bundle';

export type GameItemDefinition = {
  key: string;
  name: string;
  description: string;
  category: ItemCategoryValue;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  effectType: ItemEffectType;
  effectValue: number;
  durationMinutes?: number;
  shopPrice?: number;
  secondaryValue?: number;
  usable?: boolean;
};

export type DailyMissionTemplate = {
  id: string;
  category: MissionCategoryValue;
  title: string;
  description: string;
  difficulty: MissionDifficultyTierValue;
  baseXp: number;
  baseCoins: number;
};

export type WeeklyMissionTemplate = {
  id: string;
  category: MissionCategoryValue;
  title: string;
  description: string;
  missionType: (typeof WeeklyMissionType)[keyof typeof WeeklyMissionType];
  targetValue: number;
  difficulty: MissionDifficultyTierValue;
  baseXp: number;
  baseCoins: number;
};

export type EpicMissionType =
  | (typeof WeeklyMissionType)[keyof typeof WeeklyMissionType]
  | 'CONTRACTS_COMPLETED'
  | 'ACHIEVEMENTS_UNLOCKED'
  | 'CITY_BUILDINGS'
  | 'PET_EVOLUTIONS'
  | 'LOOT_BOXES_OPENED';

export type EpicMissionTemplate = {
  id: string;
  title: string;
  description: string;
  missionType: EpicMissionType;
  targetValue: number;
  difficulty: MissionDifficultyTierValue;
  baseXp: number;
  baseCoins: number;
};

export type MissionsDataFile = {
  version: number;
  daily: DailyMissionTemplate[];
  weekly: WeeklyMissionTemplate[];
  epic: EpicMissionTemplate[];
};

export type ItemsDataFile = {
  version: number;
  items: GameItemDefinition[];
  legacyAliases: Record<string, string>;
};
