import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler'
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates'
import { getTodayKey } from '@/features/quests/utils/date'
import { getMotivationSettings } from '@/storage/repositories/motivation-settings-repository'
import { MotivationSparkRepository } from '@/storage/repositories/motivation-spark-repository'
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository'
import type { MotivationSparkRecord } from '@/types/motivation-spark'
import { NotificationCategory } from '@/types/notification'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import {
    buildMotivationNotificationContent,
    type MotivationNotificationVariant,
} from '../utils/motivation-notification-copy'
import {
    buildMotivationDailyNotificationId,
    buildMotivationEveningNotificationId,
    buildMotivationSparkDeepLinkPath,
    MOTIVATION_NOTIFICATION_PREFIX,
    resolveMotivationNotificationScheduleTime,
    shouldScheduleMotivationEveningNotification,
    shouldScheduleMotivationNotification,
} from '../utils/motivation-notification-scheduling'
import { MotivationDailyPickService } from './motivation-daily-pick-service'

const MOTIVATION_ACCENT = '#f97316'

const buildRichVisual = (spark: MotivationSparkRecord, tagline: string) => {
  const heroImage = spark.images[0] ?? null

  return {
    heroEmoji: spark.isPinned ? '⭐' : MOTIVATION_UI.hub.emoji,
    accentColor: MOTIVATION_ACCENT,
    tagline,
    ...(heroImage ? { imageUri: heroImage } : {}),
  }
}

const scheduleSparkNotification = async (input: {
  identifier: string
  triggerDate: Date
  spark: MotivationSparkRecord
  variant: MotivationNotificationVariant
  dateKey: string
}): Promise<boolean> => {
  const content = buildMotivationNotificationContent(input.spark, input.variant, input.dateKey)
  const body = `${content.body}\n${MOTIVATION_UI.notifications.openCta}`

  return scheduleLocalNotification({
    identifier: input.identifier,
    triggerDate: input.triggerDate,
    deepLinkPath: buildMotivationSparkDeepLinkPath(input.spark.id),
    candidate: {
      category: NotificationCategory.MOTIVATION_SPARK,
      title: content.title,
      body,
      priority: 4,
      rich: buildRichVisual(input.spark, content.tagline),
    },
  })
}

export const MotivationNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return

    const [notificationSettings, motivationSettings, activeCount] = await Promise.all([
      getNotificationSettings(),
      getMotivationSettings(),
      MotivationSparkRepository.countActive(),
    ])

    await cancelNotificationsByPrefix(MOTIVATION_NOTIFICATION_PREFIX)

    if (activeCount === 0) return
    if (!notificationSettings.enabled || !notificationSettings.motivationSpark) return
    if (!motivationSettings.enabled) return

    const todayKey = getTodayKey()
    const daily = await MotivationDailyPickService.getDailySpark(todayKey)
    if (!daily) return

    const morningAlreadySent = Boolean(daily.pick.notifiedAt)
    const preferredHour = motivationSettings.preferredHour ?? notificationSettings.preferredHour
    const preferredMinute =
      motivationSettings.preferredMinute ?? notificationSettings.preferredMinute
    const morningTrigger = resolveMotivationNotificationScheduleTime({
      preferredHour,
      preferredMinute,
      allowSoonFallback: !morningAlreadySent,
    })

    if (
      !morningAlreadySent &&
      shouldScheduleMotivationNotification({
        globalEnabled: notificationSettings.enabled,
        motivationSparkEnabled: notificationSettings.motivationSpark,
        featureEnabled: motivationSettings.enabled,
        dailyNotification: motivationSettings.dailyNotification,
        hasActiveSparks: activeCount > 0,
        triggerDate: morningTrigger,
      })
    ) {
      const scheduled = await scheduleSparkNotification({
        identifier: buildMotivationDailyNotificationId(todayKey),
        triggerDate: morningTrigger!,
        spark: daily.spark,
        variant: 'morning',
        dateKey: todayKey,
      })

      if (scheduled) {
        await MotivationDailyPickService.markNotified(todayKey, new Date().toISOString())
      }
    }

    const eveningAlreadySent = Boolean(daily.pick.eveningNotifiedAt)
    const eveningTrigger = resolveMotivationNotificationScheduleTime({
      preferredHour: motivationSettings.eveningHour,
      preferredMinute: motivationSettings.eveningMinute,
      allowSoonFallback: !eveningAlreadySent,
    })

    if (
      !eveningAlreadySent &&
      shouldScheduleMotivationEveningNotification({
        globalEnabled: notificationSettings.enabled,
        motivationSparkEnabled: notificationSettings.motivationSpark,
        featureEnabled: motivationSettings.enabled,
        eveningNotification: motivationSettings.eveningNotification,
        hasActiveSparks: activeCount > 0,
        triggerDate: eveningTrigger,
      })
    ) {
      const scheduled = await scheduleSparkNotification({
        identifier: buildMotivationEveningNotificationId(todayKey),
        triggerDate: eveningTrigger!,
        spark: daily.spark,
        variant: 'evening',
        dateKey: todayKey,
      })

      if (scheduled) {
        await MotivationDailyPickService.markEveningNotified(todayKey, new Date().toISOString())
      }
    }
  },
}
