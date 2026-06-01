import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getLevelUpCoinReward } from '@/features/player/utils/xp';

import {
    formatPercentage,
    formatStudyTime,
    resolveStudyMinutes,
} from '../formatters';
import { buildStatisticsInsights } from '../insights';
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

describe('statistics insights', () => {
  it('builds motivational insights from dashboard snapshot', () => {
    const insights = buildStatisticsInsights({
      overview: {
        totalStudyDays: 45,
        totalStudyTimeLabel: '15 horas',
        totalXp: 1000,
        currentLevel: 5,
        currentTitle: 'Developer',
        totalCoinsEarned: 500,
      },
      consistency: {
        currentStreak: 10,
        bestStreak: 32,
        totalStudyDays: 45,
        streaksProtected: 2,
        shieldsConsumed: 1,
      },
      quests: {
        dailyCompleted: 10,
        dailyTotal: 20,
        dailyCompletionRate: 50,
        weeklyCompleted: 3,
        weeklyTotal: 5,
        weeklyCompletionRate: 60,
      },
      pet: {
        stageLabel: 'Adult',
        stageEmoji: '🐦',
        level: 20,
        totalEvolutions: 3,
        averageMoodLabel: 'Bom',
        averageMoodScore: 70,
      },
      lootBoxes: {
        totalReceived: 5,
        totalOpened: 4,
        bestRewardLabel: '100 moedas',
        highestRarityLabel: 'Rara',
      },
      achievements: {
        unlocked: 8,
        total: 20,
        completionRate: 40,
        topCategoryLabel: 'Streak',
      },
      contracts: {
        totalAccepted: 4,
        totalCompleted: 3,
        successRate: 75,
        largestCompletedLabel: 'Weekly Focus',
      },
      city: {
        currentBuildingLabel: 'Office',
        currentBuildingEmoji: '🏢',
        totalUnlocked: 2,
        totalBuildings: 6,
        progressPercentage: 33,
      },
      insights: [],
      milestones: [],
    });

    assert.ok(insights.some((item) => item.message.includes('45 dias')));
    assert.ok(insights.some((item) => item.message.includes('32 dias')));
    assert.ok(insights.some((item) => item.message.includes('3 desafios')));
  });
});

const getExpectedLevelCoins = (level: number): number => {
  let total = 0;
  for (let currentLevel = 2; currentLevel <= level; currentLevel += 1) {
    total += getLevelUpCoinReward(currentLevel);
  }
  return total;
};
