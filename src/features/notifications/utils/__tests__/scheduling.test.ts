import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { NotificationCategory } from '@/types/notification';

import { isStudyReminderIdentifier } from '../../constants/categories';
import {
    buildNotificationCandidates,
    buildStreakRiskCandidate,
    computeScheduleTimes,
    computeStreakRiskScheduleTime,
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
        lastStudyDate: '2026-05-31',
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
        lastStudyDate: '2026-05-30',
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
        lastStudyDate: '2026-05-30',
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

describe('computeStreakRiskScheduleTime', () => {
  it('schedules 20h after the last study session when still in the future', () => {
    const context = {
      studiedToday: false,
      lastStudyDate: '2026-05-30',
      currentStreak: 7,
      shields: 1,
      hasActiveContract: false,
      contractName: null,
      petMood: null,
      hasNearAchievement: false,
      nearAchievementName: null,
      cityLevelsUntilNext: null,
      nextBuildingName: null,
    };

    const reference = new Date('2026-05-31T10:00:00');
    const riskAt = computeStreakRiskScheduleTime(context, baseSettings, reference);

    assert.ok(riskAt);
    assert.equal(riskAt?.getFullYear(), 2026);
    assert.equal(riskAt?.getMonth(), 4);
    assert.equal(riskAt?.getDate(), 31);
    assert.equal(riskAt?.getHours(), 15);
    assert.equal(riskAt?.getMinutes(), 0);
  });

  it('falls back to 20:00 when the 20h window already passed', () => {
    const context = {
      studiedToday: false,
      lastStudyDate: '2026-05-30',
      currentStreak: 3,
      shields: 0,
      hasActiveContract: false,
      contractName: null,
      petMood: null,
      hasNearAchievement: false,
      nearAchievementName: null,
      cityLevelsUntilNext: null,
      nextBuildingName: null,
    };

    const reference = new Date('2026-05-31T18:30:00');
    const riskAt = computeStreakRiskScheduleTime(context, baseSettings, reference);

    assert.ok(riskAt);
    assert.equal(riskAt?.getHours(), 20);
    assert.equal(riskAt?.getMinutes(), 0);
  });

  it('returns null when the player already studied today', () => {
    const riskAt = computeStreakRiskScheduleTime(
      {
        studiedToday: true,
        lastStudyDate: '2026-05-31',
        currentStreak: 5,
        shields: 1,
        hasActiveContract: false,
        contractName: null,
        petMood: null,
        hasNearAchievement: false,
        nearAchievementName: null,
        cityLevelsUntilNext: null,
        nextBuildingName: null,
      },
      baseSettings,
    );

    assert.equal(riskAt, null);
  });
});

describe('buildStreakRiskCandidate', () => {
  it('builds an urgent streak risk notification with the current streak', () => {
    const candidate = buildStreakRiskCandidate(
      {
        studiedToday: false,
        lastStudyDate: '2026-05-30',
        currentStreak: 9,
        shields: 0,
        hasActiveContract: false,
        contractName: null,
        petMood: null,
        hasNearAchievement: false,
        nearAchievementName: null,
        cityLevelsUntilNext: null,
        nextBuildingName: null,
      },
      baseSettings,
      0,
    );

    assert.ok(candidate);
    assert.equal(candidate?.category, NotificationCategory.STREAK_RISK);
    assert.match(candidate?.body ?? '', /9 dias em risco/);
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
