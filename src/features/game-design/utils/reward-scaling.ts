import type { LearningDifficultyValue } from '../constants/difficulty';
import { getDifficultyConfig } from '../constants/difficulty';
import { DIFFICULTY_TIER_MULTIPLIERS, type MissionDifficultyTierValue } from '../constants/mission-types';

export const scaleReward = (
  base: number,
  difficultyTier: MissionDifficultyTierValue,
  learningDifficulty: LearningDifficultyValue,
): number => {
  const tier = DIFFICULTY_TIER_MULTIPLIERS[difficultyTier];
  const config = getDifficultyConfig(learningDifficulty);
  return Math.max(1, Math.round(base * tier.xp * config.xpMultiplier));
};

export const scaleCoins = (
  base: number,
  difficultyTier: MissionDifficultyTierValue,
  learningDifficulty: LearningDifficultyValue,
): number => {
  const tier = DIFFICULTY_TIER_MULTIPLIERS[difficultyTier];
  const config = getDifficultyConfig(learningDifficulty);
  return Math.max(1, Math.round(base * tier.coins * config.coinMultiplier));
};

export const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const pickDeterministicSubset = <T>(
  items: T[],
  count: number,
  seed: string,
): T[] => {
  const sorted = [...items].sort((left, right) => {
    const leftKey = `${seed}-${JSON.stringify(left)}`;
    const rightKey = `${seed}-${JSON.stringify(right)}`;
    return hashString(leftKey) - hashString(rightKey);
  });

  if (count >= items.length) return sorted;

  return sorted.slice(0, count);
};
