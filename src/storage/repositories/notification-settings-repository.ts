import { eq } from 'drizzle-orm';

import type { NotificationSettings } from '@/types/notification';

import { getDb } from '../database/client';
import { notificationSettings } from '../database/schema';

const DEFAULT_SETTINGS: NotificationSettings = {
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
  routineReminder: true,
  journalReview: true,
  flashDue: true,
  weeklyMission: true,
  lootReminder: true,
  duelReminder: true,
  lexiconReminder: true,
  seasonReminder: true,
  prestigeReminder: true,
  shopOfferReminder: true,
  updatedAt: new Date().toISOString(),
};

const mapRow = (row: typeof notificationSettings.$inferSelect): NotificationSettings => ({
  enabled: row.enabled,
  preferredHour: row.preferredHour,
  preferredMinute: row.preferredMinute,
  dailyReminder: row.dailyReminder,
  streakReminder: row.streakReminder,
  shieldWarning: row.shieldWarning,
  petReminder: row.petReminder,
  contractReminder: row.contractReminder,
  achievementProgress: row.achievementProgress,
  cityProgress: row.cityProgress,
  routineReminder: row.routineReminder ?? true,
  journalReview: row.journalReview ?? true,
  flashDue: row.flashDue ?? true,
  weeklyMission: row.weeklyMission ?? true,
  lootReminder: row.lootReminder ?? true,
  duelReminder: row.duelReminder ?? true,
  lexiconReminder: row.lexiconReminder ?? true,
  seasonReminder: row.seasonReminder ?? true,
  prestigeReminder: row.prestigeReminder ?? true,
  shopOfferReminder: row.shopOfferReminder ?? true,
  updatedAt: row.updatedAt,
});

export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const db = getDb();
  const rows = await db.select().from(notificationSettings).where(eq(notificationSettings.id, 1)).limit(1);
  return rows[0] ? mapRow(rows[0]) : DEFAULT_SETTINGS;
};

export const saveNotificationSettings = async (settings: NotificationSettings): Promise<void> => {
  const db = getDb();
  const updatedAt = new Date().toISOString();

  await db
    .insert(notificationSettings)
    .values({
      id: 1,
      enabled: settings.enabled,
      preferredHour: settings.preferredHour,
      preferredMinute: settings.preferredMinute,
      dailyReminder: settings.dailyReminder,
      streakReminder: settings.streakReminder,
      shieldWarning: settings.shieldWarning,
      petReminder: settings.petReminder,
      contractReminder: settings.contractReminder,
      achievementProgress: settings.achievementProgress,
      cityProgress: settings.cityProgress,
      routineReminder: settings.routineReminder,
      journalReview: settings.journalReview,
      flashDue: settings.flashDue,
      weeklyMission: settings.weeklyMission,
      lootReminder: settings.lootReminder,
      duelReminder: settings.duelReminder,
      lexiconReminder: settings.lexiconReminder,
      seasonReminder: settings.seasonReminder,
      prestigeReminder: settings.prestigeReminder,
      shopOfferReminder: settings.shopOfferReminder,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: notificationSettings.id,
      set: {
        enabled: settings.enabled,
        preferredHour: settings.preferredHour,
        preferredMinute: settings.preferredMinute,
        dailyReminder: settings.dailyReminder,
        streakReminder: settings.streakReminder,
        shieldWarning: settings.shieldWarning,
        petReminder: settings.petReminder,
        contractReminder: settings.contractReminder,
        achievementProgress: settings.achievementProgress,
        cityProgress: settings.cityProgress,
        routineReminder: settings.routineReminder,
        journalReview: settings.journalReview,
        flashDue: settings.flashDue,
        weeklyMission: settings.weeklyMission,
        lootReminder: settings.lootReminder,
        duelReminder: settings.duelReminder,
        lexiconReminder: settings.lexiconReminder,
        seasonReminder: settings.seasonReminder,
        prestigeReminder: settings.prestigeReminder,
        shopOfferReminder: settings.shopOfferReminder,
        updatedAt,
      },
    });
};

export const getOrCreateNotificationSettings = async (): Promise<NotificationSettings> => {
  const settings = await getNotificationSettings();
  await saveNotificationSettings(settings);
  return settings;
};
