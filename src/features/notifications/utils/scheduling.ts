import {
  NotificationCategory,
  type NotificationCandidate,
  type NotificationContext,
  type NotificationSettings,
} from '@/types/notification';
import { PetMood } from '@/types/pet';

import {
  MAX_DAILY_NOTIFICATIONS,
  NOTIFICATION_PRIORITY,
  NOTIFICATION_TITLE,
  STREAK_RISK_HOURS,
} from '../constants/categories';
import { buildStreakRiskBody, pickNotificationMessage } from '../constants/messages';

const STREAK_RISK_MS = STREAK_RISK_HOURS * 60 * 60 * 1000;

export const isCategoryEnabled = (
  settings: NotificationSettings,
  category: string,
): boolean => {
  switch (category) {
    case NotificationCategory.DAILY_REMINDER:
      return settings.dailyReminder;
    case NotificationCategory.STREAK_REMINDER:
    case NotificationCategory.STREAK_RISK:
      return settings.streakReminder;
    case NotificationCategory.SHIELD_WARNING:
      return settings.shieldWarning;
    case NotificationCategory.PET_REMINDER:
      return settings.petReminder;
    case NotificationCategory.CONTRACT_REMINDER:
      return settings.contractReminder;
    case NotificationCategory.ACHIEVEMENT_PROGRESS:
      return settings.achievementProgress;
    case NotificationCategory.CITY_PROGRESS:
      return settings.cityProgress;
    default:
      return false;
  }
};

export const shouldIncludePetReminder = (context: NotificationContext): boolean => {
  if (context.petMood === PetMood.SAD || context.petMood === PetMood.VERY_SAD) {
    return true;
  }
  return context.petMood !== null && !context.studiedToday;
};

export const buildNotificationIdentifier = (dateKey: string, category: string): string =>
  `eq-${dateKey}-${category}`;

export const computeStreakRiskScheduleTime = (
  context: NotificationContext,
  settings: NotificationSettings,
  referenceDate = new Date(),
): Date | null => {
  if (context.studiedToday) return null
  if (context.currentStreak <= 0) return null
  if (!isCategoryEnabled(settings, NotificationCategory.STREAK_RISK)) return null
  if (!context.lastStudyDate) return null

  const [year, month, day] = context.lastStudyDate.split('-').map(Number)
  if (!year || !month || !day) return null

  const lastStudyAt = new Date(
    year,
    month - 1,
    day,
    settings.preferredHour,
    settings.preferredMinute,
    0,
    0,
  )
  const riskAt = new Date(lastStudyAt.getTime() + STREAK_RISK_MS)
  const now = referenceDate.getTime()

  if (riskAt.getTime() > now) {
    return riskAt
  }

  const eveningCutoff = new Date(referenceDate)
  eveningCutoff.setHours(20, 0, 0, 0)
  if (eveningCutoff.getTime() > now) {
    return eveningCutoff
  }

  const lastChance = new Date(referenceDate)
  lastChance.setHours(settings.preferredHour + 2, settings.preferredMinute, 0, 0)
  if (lastChance.getTime() > now) {
    return lastChance
  }

  return new Date(now + 2 * 60 * 1000)
}

export const buildStreakRiskCandidate = (
  context: NotificationContext,
  settings: NotificationSettings,
  seed = 0,
): NotificationCandidate | null => {
  if (!computeStreakRiskScheduleTime(context, settings)) return null

  return {
    category: NotificationCategory.STREAK_RISK,
    title: NOTIFICATION_TITLE,
    body: buildStreakRiskBody(context.currentStreak, seed),
    priority: NOTIFICATION_PRIORITY[NotificationCategory.STREAK_RISK] ?? 0,
  }
}

export const computeScheduleTimes = (
  preferredHour: number,
  preferredMinute: number,
  count: number,
  referenceDate = new Date(),
): Date[] => {
  const main = new Date(referenceDate);
  main.setHours(preferredHour, preferredMinute, 0, 0);

  const pre = new Date(main);
  pre.setMinutes(pre.getMinutes() - 30);

  const last = new Date(main);
  last.setHours(last.getHours() + 2);

  const slots = [pre, main, last];
  return slots.slice(0, Math.max(0, Math.min(count, MAX_DAILY_NOTIFICATIONS)));
};

export const buildNotificationCandidates = (
  context: NotificationContext,
  settings: NotificationSettings,
  seed = 0,
): NotificationCandidate[] => {
  if (context.studiedToday) {
    return [];
  }

  const candidates: NotificationCandidate[] = [];

  const pushCandidate = (category: string, body?: string) => {
    if (!isCategoryEnabled(settings, category)) return;

    candidates.push({
      category: category as NotificationCandidate['category'],
      title: NOTIFICATION_TITLE,
      body: body ?? pickNotificationMessage(category, seed),
      priority: NOTIFICATION_PRIORITY[category] ?? 99,
    });
  };

  if (context.currentStreak > 0) {
    pushCandidate(NotificationCategory.STREAK_REMINDER);
  }

  if (context.shields === 0 && context.currentStreak > 0) {
    pushCandidate(NotificationCategory.SHIELD_WARNING);
  }

  if (context.hasActiveContract) {
    pushCandidate(
      NotificationCategory.CONTRACT_REMINDER,
      context.contractName
        ? `${context.contractName} — keep going today.`
        : undefined,
    );
  }

  if (shouldIncludePetReminder(context)) {
    pushCandidate(NotificationCategory.PET_REMINDER);
  }

  pushCandidate(NotificationCategory.DAILY_REMINDER);

  if (context.cityLevelsUntilNext !== null && context.cityLevelsUntilNext <= 2) {
    pushCandidate(
      NotificationCategory.CITY_PROGRESS,
      context.nextBuildingName
        ? `Study to unlock ${context.nextBuildingName}.`
        : undefined,
    );
  }

  if (context.hasNearAchievement) {
    pushCandidate(
      NotificationCategory.ACHIEVEMENT_PROGRESS,
      context.nearAchievementName
        ? `You're close to ${context.nearAchievementName}.`
        : undefined,
    );
  }

  return candidates.sort((a, b) => a.priority - b.priority);
};

export const selectNotificationsForDay = (
  candidates: NotificationCandidate[],
  sentCategories: string[],
  alreadySentCount: number,
  maxDaily = MAX_DAILY_NOTIFICATIONS,
): NotificationCandidate[] => {
  const remainingSlots = Math.max(0, maxDaily - alreadySentCount);
  if (remainingSlots === 0) return [];

  const selected: NotificationCandidate[] = [];
  const usedCategories = new Set(sentCategories);

  for (const candidate of candidates) {
    if (selected.length >= remainingSlots) break;
    if (usedCategories.has(candidate.category)) continue;

    selected.push(candidate);
    usedCategories.add(candidate.category);
  }

  return selected;
};

export const getDayStartIso = (dateKey: string): string => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0).toISOString();
};
