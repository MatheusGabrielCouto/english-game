import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getLevelUpCoinReward } from '@/features/player/utils/xp';

import {
    formatPercentage,
    formatStudyTime,
    resolveStudyMinutes,
} from '../formatters';
import {
    computeTotalCoinsEarned,
    computeTotalLevelUpCoins,
} from '../metrics';

describe('statistics formatters', () => {
  it('formats study time in hours', () => {
    assert.equal(formatStudyTime(125 * 60), '125 horas');
  });

  it('formats study time with minutes remainder', () => {
    assert.equal(formatStudyTime(95), '1h 35min');
  });

  it('calculates completion percentage', () => {
    assert.equal(formatPercentage(3, 4), 75);
  });

  it('uses estimated minutes when tracked value is lower', () => {
    assert.equal(resolveStudyMinutes(10, 5, 20), 100);
  });
});

describe('statistics metrics', () => {
  it('sums level-up coin rewards', () => {
    const total = computeTotalLevelUpCoins(3);
    assert.equal(total, getExpectedLevelCoins(3));
  });

  it('aggregates total coins earned from sources', () => {
    const total = computeTotalCoinsEarned({
      level: 2,
      achievementCoins: 100,
      lootBoxCoins: 50,
      contractCoins: 25,
    });

    assert.equal(total, computeTotalLevelUpCoins(2) + 175);
  });
});

const getExpectedLevelCoins = (level: number): number => {
  let total = 0;
  for (let currentLevel = 2; currentLevel <= level; currentLevel += 1) {
    total += getLevelUpCoinReward(currentLevel);
  }
  return total;
};
