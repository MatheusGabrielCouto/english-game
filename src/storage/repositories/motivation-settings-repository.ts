import { eq } from 'drizzle-orm'

import type { MotivationSettingsRecord } from '@/types/motivation-spark'

import { getDb } from '../database/client'
import { motivationSettings } from '../database/schema'

const DEFAULT_SETTINGS: MotivationSettingsRecord = {
  enabled: true,
  dailyNotification: true,
  eveningNotification: false,
  preferredHour: 7,
  preferredMinute: 0,
  eveningHour: 20,
  eveningMinute: 0,
  avoidRepeatDays: 7,
  showOnHome: true,
  updatedAt: new Date().toISOString(),
}

const mapRow = (row: typeof motivationSettings.$inferSelect): MotivationSettingsRecord => ({
  enabled: row.enabled,
  dailyNotification: row.dailyNotification,
  eveningNotification: row.eveningNotification,
  preferredHour: row.preferredHour,
  preferredMinute: row.preferredMinute,
  eveningHour: row.eveningHour,
  eveningMinute: row.eveningMinute,
  avoidRepeatDays: row.avoidRepeatDays,
  showOnHome: row.showOnHome,
  updatedAt: row.updatedAt,
})

export const getMotivationSettings = async (): Promise<MotivationSettingsRecord> => {
  const db = getDb()
  const rows = await db.select().from(motivationSettings).where(eq(motivationSettings.id, 1)).limit(1)
  return rows[0] ? mapRow(rows[0]) : DEFAULT_SETTINGS
}

export const saveMotivationSettings = async (
  settings: MotivationSettingsRecord,
): Promise<void> => {
  const db = getDb()
  const updatedAt = new Date().toISOString()

  await db
    .insert(motivationSettings)
    .values({
      id: 1,
      enabled: settings.enabled,
      dailyNotification: settings.dailyNotification,
      eveningNotification: settings.eveningNotification,
      preferredHour: settings.preferredHour,
      preferredMinute: settings.preferredMinute,
      eveningHour: settings.eveningHour,
      eveningMinute: settings.eveningMinute,
      avoidRepeatDays: settings.avoidRepeatDays,
      showOnHome: settings.showOnHome,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: motivationSettings.id,
      set: {
        enabled: settings.enabled,
        dailyNotification: settings.dailyNotification,
        eveningNotification: settings.eveningNotification,
        preferredHour: settings.preferredHour,
        preferredMinute: settings.preferredMinute,
        eveningHour: settings.eveningHour,
        eveningMinute: settings.eveningMinute,
        avoidRepeatDays: settings.avoidRepeatDays,
        showOnHome: settings.showOnHome,
        updatedAt,
      },
    })
}

export const getOrCreateMotivationSettings = async (): Promise<MotivationSettingsRecord> => {
  const settings = await getMotivationSettings()
  await saveMotivationSettings(settings)
  return settings
}
