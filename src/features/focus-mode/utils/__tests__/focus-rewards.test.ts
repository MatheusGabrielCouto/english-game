import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { FocusSessionStatus, FocusStudyType } from '@/types/focus-mode';

import { computeFocusBonusMultiplier, computeFocusRewards, computeSessionCompletionRatio } from '../focus-rewards';

describe('computeFocusBonusMultiplier', () => {
  it('applies light penalty for distraction', () => {
    const normal = computeFocusBonusMultiplier(120, false);
    const hardcore = computeFocusBonusMultiplier(120, true);
    assert.ok(normal > hardcore);
    assert.ok(normal >= 0.5);
  });

  it('caps penalty at 50%', () => {
    const multiplier = computeFocusBonusMultiplier(3600, true);
    assert.equal(multiplier, 0.5);
  });
});

describe('computeFocusRewards', () => {
  it('returns higher rewards for longer sessions with good focus', () => {
    const session = {
      id: 1,
      studyType: FocusStudyType.VOCABULARY,
      plannedDurationSec: 3600,
      status: FocusSessionStatus.ACTIVE,
      startedAt: new Date().toISOString(),
      endedAt: null,
      focusedSeconds: 3300,
      distractedSeconds: 60,
      idleSeconds: 0,
      pauseSeconds: 0,
      wordsLearned: 5,
      xpEarned: 0,
      coinsEarned: 0,
      spEarned: 0,
      bonusMultiplier: 1,
      lootBoxGranted: false,
      lootBoxRarity: null,
      abandonReason: null,
    };

    const rewards = computeFocusRewards({
      session,
      durationMinutes: 60,
      hardcoreMode: false,
    });

    assert.ok(rewards.xp >= 100);
    assert.ok(rewards.coins >= 50);
    assert.ok(rewards.studyPoints > 0);
    assert.ok(rewards.focusRatio > 0.9);
  });

  it('reduces rewards when heavily distracted', () => {
    const baseSession = {
      id: 2,
      studyType: FocusStudyType.READING,
      plannedDurationSec: 1800,
      status: FocusSessionStatus.ACTIVE,
      startedAt: new Date().toISOString(),
      endedAt: null,
      focusedSeconds: 900,
      distractedSeconds: 900,
      idleSeconds: 0,
      pauseSeconds: 0,
      wordsLearned: 0,
      xpEarned: 0,
      coinsEarned: 0,
      spEarned: 0,
      bonusMultiplier: 1,
      lootBoxGranted: false,
      lootBoxRarity: null,
      abandonReason: null,
    };

    const focused = computeFocusRewards({
      session: { ...baseSession, focusedSeconds: 1700, distractedSeconds: 100 },
      durationMinutes: 30,
      hardcoreMode: false,
    });

    const distracted = computeFocusRewards({
      session: baseSession,
      durationMinutes: 30,
      hardcoreMode: false,
    });

    assert.ok(focused.xp > distracted.xp);
    assert.ok(focused.studyPoints > distracted.studyPoints);
  });

  it('reduces tier rewards when session ends before planned duration', () => {
    const fullSession = {
      id: 3,
      studyType: FocusStudyType.VOCABULARY,
      plannedDurationSec: 1800,
      status: FocusSessionStatus.ACTIVE,
      startedAt: new Date().toISOString(),
      endedAt: null,
      focusedSeconds: 1700,
      distractedSeconds: 100,
      idleSeconds: 0,
      pauseSeconds: 0,
      wordsLearned: 0,
      xpEarned: 0,
      coinsEarned: 0,
      spEarned: 0,
      bonusMultiplier: 1,
      lootBoxGranted: false,
      lootBoxRarity: null,
      abandonReason: null,
    };

    const earlySession = { ...fullSession, focusedSeconds: 850, distractedSeconds: 50 };

    const full = computeFocusRewards({
      session: fullSession,
      durationMinutes: 30,
      hardcoreMode: false,
    });
    const early = computeFocusRewards({
      session: earlySession,
      durationMinutes: 30,
      hardcoreMode: false,
    });

    assert.equal(computeSessionCompletionRatio(fullSession), 1);
    assert.ok(computeSessionCompletionRatio(earlySession) < 0.55);
    assert.ok(early.xp < full.xp);
    assert.ok(early.coins < full.coins);
    assert.equal(early.completionRatio, computeSessionCompletionRatio(earlySession));
    assert.ok(early.xp / full.xp < 0.6);
  });
});
