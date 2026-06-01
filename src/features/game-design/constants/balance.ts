/** Global cap for stacked XP/coin/loot bonuses from relics + prestige + RPG + pets. */
export const GLOBAL_BONUS_CAP_PERCENT = 25;

/** Pet receives this share of player XP gains. */
export const PET_XP_PLAYER_SHARE = 0.15;

/** Max coins earned from farm activities per day. */
export const DAILY_FARM_COIN_CAP = 200;

/** Opens without epic+ box reward triggers pity upgrade. */
export const LOOT_PITY_THRESHOLD = 30;

/** Level milestone reward interval. */
export const LEVEL_MILESTONE_INTERVAL = 5;

/** XP required for level L → L+1: 100 + (L-1) × 85 */
export const XP_BASE = 100;
export const XP_PER_LEVEL_INCREMENT = 85;

/** Pet XP per level: L × multiplier (lower = faster evolution). */
export const PET_XP_PER_LEVEL = 35;
