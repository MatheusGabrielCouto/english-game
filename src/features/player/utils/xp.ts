import { XP_BASE, XP_PER_LEVEL_INCREMENT } from '@/features/game-design/constants/balance';

import { LEVEL_UP_COIN_MULTIPLIER } from '../constants';

/** XP to go from level L → L+1. Softer curve: 100 + (L-1) × 85 */
export const getRequiredXP = (level: number): number =>
  XP_BASE + Math.max(0, level - 1) * XP_PER_LEVEL_INCREMENT;

export const getLevelUpCoinReward = (newLevel: number): number =>
  newLevel * LEVEL_UP_COIN_MULTIPLIER;

export type XPProgress = {
  current: number;
  required: number;
  percentage: number;
};

export const getXPProgress = (level: number, xp: number): XPProgress => {
  const required = getRequiredXP(level);
  const percentage = required > 0 ? Math.min(100, (xp / required) * 100) : 0;

  return { current: xp, required, percentage };
};

export type LevelUpResult = {
  level: number;
  xp: number;
  coinsEarned: number;
  didLevelUp: boolean;
};

/** Sobe um nível se houver XP suficiente; o excedente permanece em xp. */
export const applySingleLevelUp = (
  level: number,
  xp: number,
): LevelUpResult => {
  const required = getRequiredXP(level);

  if (xp < required) {
    return { level, xp, coinsEarned: 0, didLevelUp: false };
  }

  const newLevel = level + 1;
  const remainingXp = xp - required;
  const coinsEarned = getLevelUpCoinReward(newLevel);

  return {
    level: newLevel,
    xp: remainingXp,
    coinsEarned,
    didLevelUp: true,
  };
};

/** Aplica XP e processa todos os level-ups encadeados. */
export const applyXPWithLevelUps = (
  level: number,
  xp: number,
  amount: number,
): { level: number; xp: number; totalCoinsEarned: number; levelsGained: number } => {
  let currentLevel = level;
  let currentXp = xp + amount;
  let totalCoinsEarned = 0;
  let levelsGained = 0;

  let result = applySingleLevelUp(currentLevel, currentXp);

  while (result.didLevelUp) {
    currentLevel = result.level;
    currentXp = result.xp;
    totalCoinsEarned += result.coinsEarned;
    levelsGained += 1;
    result = applySingleLevelUp(currentLevel, currentXp);
  }

  return {
    level: currentLevel,
    xp: currentXp,
    totalCoinsEarned,
    levelsGained,
  };
};
