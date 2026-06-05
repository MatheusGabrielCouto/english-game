import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AchievementDefinition } from '@/types/achievement';
import { AchievementCategory } from '@/types/achievement';
import { PetStage } from '@/types/pet';

import {
    buildAchievementProgress,
    computeLifetimeXp,
    getMetricValue,
    isAchievementMet,
    resolveTargetValue,
    type AchievementMetricsSnapshot,
} from '../progress';

const baseSnapshot = (): AchievementMetricsSnapshot => ({
  totalStudyDays: 0,
  bestStreak: 0,
  playerLevel: 1,
  petStage: PetStage.EGG,
  petMaxGeneration: 0,
  stats: {
    totalMissionsCompleted: 0,
    totalXpEarned: 0,
    totalLootBoxesOpened: 0,
    totalDuelWins: 0,
    totalFlashReviews: 0,
    totalRoutinesCompleted: 0,
    totalJournalEntries: 0,
    totalJournalVoiceNotes: 0,
    totalJournalReviews: 0,
    totalJournalConnections: 0,
  },
});

const streakAchievement = (): AchievementDefinition => ({
  key: 'streak_7',
  name: '7 Days',
  description: '7 day streak',
  category: AchievementCategory.STREAK,
  metric: 'best_streak',
  target: 7,
  icon: '🔥',
  rewards: [],
});

describe('computeLifetimeXp', () => {
  it('sums xp from previous levels plus current xp', () => {
    assert.equal(computeLifetimeXp(1, 50), 50);
    assert.equal(computeLifetimeXp(2, 20), 120);
    assert.equal(computeLifetimeXp(3, 0), 300);
  });
});

describe('resolveTargetValue', () => {
  it('returns numeric targets as-is', () => {
    assert.equal(resolveTargetValue(10), 10);
  });

  it('maps pet stage targets to stage order index', () => {
    assert.equal(resolveTargetValue(PetStage.BABY), 1);
    assert.equal(resolveTargetValue(PetStage.LEGENDARY), 4);
  });
});

describe('getMetricValue', () => {
  it('reads values from snapshot fields', () => {
    const snapshot = {
      ...baseSnapshot(),
      bestStreak: 12,
      playerLevel: 8,
      stats: {
        totalMissionsCompleted: 5,
        totalXpEarned: 900,
        totalLootBoxesOpened: 2,
      },
    };

    assert.equal(getMetricValue('best_streak', snapshot), 12);
    assert.equal(getMetricValue('player_level', snapshot), 8);
    assert.equal(getMetricValue('total_missions_completed', snapshot), 5);
  });
});

describe('buildAchievementProgress', () => {
  it('marks locked achievements with zero progress', () => {
    const progress = buildAchievementProgress(streakAchievement(), baseSnapshot(), null);
    assert.equal(progress.status, 'locked');
    assert.equal(progress.current, 0);
    assert.equal(progress.target, 7);
  });

  it('marks in-progress achievements when partially complete', () => {
    const snapshot = { ...baseSnapshot(), bestStreak: 3 };
    const progress = buildAchievementProgress(streakAchievement(), snapshot, null);
    assert.equal(progress.status, 'in_progress');
    assert.equal(progress.progressLabel, '3 / 7 dias');
  });

  it('marks unlocked achievements at 100%', () => {
    const snapshot = { ...baseSnapshot(), bestStreak: 20 };
    const progress = buildAchievementProgress(streakAchievement(), snapshot, '2026-05-31T00:00:00.000Z');
    assert.equal(progress.status, 'unlocked');
    assert.equal(progress.percentage, 100);
  });
});

describe('isAchievementMet', () => {
  it('returns true when metric meets target', () => {
    const snapshot = { ...baseSnapshot(), bestStreak: 7 };
    assert.equal(isAchievementMet(streakAchievement(), snapshot), true);
  });

  it('returns false when metric is below target', () => {
    const snapshot = { ...baseSnapshot(), bestStreak: 6 };
    assert.equal(isAchievementMet(streakAchievement(), snapshot), false);
  });
});
