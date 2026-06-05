import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { NotificationCategory } from '@/types/notification';

import { isStudyReminderIdentifier } from '../../constants/categories';
import {
    buildNotificationCandidates,
    computeScheduleTimes,
    selectNotificationsForDay,
} from '../scheduling';

const baseSettings = {
  enabled: true,
  preferredHour: 19,
  preferredMinute: 0,
  dailyReminder: true,
  streakReminder: true,
  shieldWarning: true,
  petReminder: true,
  contractReminder: true,
  achievementProgress: true,
  cityProgress: true,
  updatedAt: '2026-05-31T00:00:00.000Z',
};

describe('buildNotificationCandidates', () => {
  it('returns no candidates when the player already studied today', () => {
    const candidates = buildNotificationCandidates(
      {
        studiedToday: true,
        currentStreak: 5,
        shields: 1,
        hasActiveContract: true,
        contractName: 'Focus',
        petMood: 'happy',
        hasNearAchievement: true,
        nearAchievementName: 'Streak Master',
        cityLevelsUntilNext: 1,
        nextBuildingName: 'Office',
      },
      baseSettings,
    );

    assert.equal(candidates.length, 0);
  });

  it('prioritizes streak and shield reminders when the player has not studied', () => {
    const candidates = buildNotificationCandidates(
      {
        studiedToday: false,
        currentStreak: 4,
        shields: 0,
        hasActiveContract: true,
        contractName: 'Focus',
        petMood: 'sad',
        hasNearAchievement: true,
        nearAchievementName: 'Streak Master',
        cityLevelsUntilNext: 1,
        nextBuildingName: 'Office',
      },
      baseSettings,
    );

    assert.equal(candidates[0]?.category, NotificationCategory.STREAK_REMINDER);
    assert.equal(candidates[1]?.category, NotificationCategory.SHIELD_WARNING);
    assert.equal(candidates[2]?.category, NotificationCategory.CONTRACT_REMINDER);
  });
});

describe('selectNotificationsForDay', () => {
  it('limits notifications to three per day and one per category', () => {
    const candidates = buildNotificationCandidates(
      {
        studiedToday: false,
        currentStreak: 4,
        shields: 0,
        hasActiveContract: true,
        contractName: 'Focus',
        petMood: 'sad',
        hasNearAchievement: true,
        nearAchievementName: 'Streak Master',
        cityLevelsUntilNext: 1,
        nextBuildingName: 'Office',
      },
      baseSettings,
    );

    const selected = selectNotificationsForDay(candidates, [NotificationCategory.STREAK_REMINDER], 1);

    assert.equal(selected.length, 2);
    assert.ok(selected.every((item) => item.category !== NotificationCategory.STREAK_REMINDER));
  });
});

describe('computeScheduleTimes', () => {
  it('creates pre, main and last-chance slots around the preferred time', () => {
    const reference = new Date('2026-05-31T12:00:00');
    const times = computeScheduleTimes(19, 0, 3, reference);

    assert.equal(times.length, 3);
    assert.equal(times[0].getHours(), 18);
    assert.equal(times[0].getMinutes(), 30);
    assert.equal(times[1].getHours(), 19);
    assert.equal(times[2].getHours(), 21);
  });
});

describe('isStudyReminderIdentifier', () => {
  it('matches only daily study reminders', () => {
    assert.equal(isStudyReminderIdentifier('eq-2026-06-04-daily_reminder'), true);
    assert.equal(isStudyReminderIdentifier('eq-pet-adv-12'), false);
    assert.equal(isStudyReminderIdentifier('eq-pet-incubator-3'), false);
    assert.equal(isStudyReminderIdentifier('eq-pet-egg-hatch'), false);
    assert.equal(isStudyReminderIdentifier('eq-flash-due-reminder'), false);
  });
});
