import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories'

export const MOTIVATION_NOTIFICATION_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-motivation-`

export const buildMotivationDailyNotificationId = (dateKey: string): string =>
  `${MOTIVATION_NOTIFICATION_PREFIX}daily-${dateKey}`

export const buildMotivationEveningNotificationId = (dateKey: string): string =>
  `${MOTIVATION_NOTIFICATION_PREFIX}evening-${dateKey}`

export const buildMotivationSparkDeepLinkPath = (sparkId: string): string => `/motivation/${sparkId}`

export const resolveMotivationNotificationScheduleTime = (input: {
  preferredHour: number
  preferredMinute: number
  referenceDate?: Date
  /** One-time grace when the slot was missed today (e.g. user just enabled notifications). */
  allowSoonFallback?: boolean
}): Date | null => {
  const referenceDate = input.referenceDate ?? new Date()
  const trigger = new Date(referenceDate)
  trigger.setHours(input.preferredHour, input.preferredMinute, 0, 0)

  if (trigger.getTime() > referenceDate.getTime()) {
    return trigger
  }

  if (input.allowSoonFallback) {
    const soon = new Date(referenceDate)
    soon.setMinutes(soon.getMinutes() + 2)
    return soon
  }

  return null
}

export const shouldScheduleMotivationNotification = (input: {
  globalEnabled: boolean
  motivationSparkEnabled: boolean
  featureEnabled: boolean
  dailyNotification: boolean
  hasActiveSparks: boolean
  triggerDate: Date | null
  referenceDate?: Date
}): boolean => {
  if (!input.globalEnabled) return false
  if (!input.motivationSparkEnabled) return false
  if (!input.featureEnabled) return false
  if (!input.dailyNotification) return false
  if (!input.hasActiveSparks) return false
  if (!input.triggerDate) return false

  const referenceDate = input.referenceDate ?? new Date()
  return input.triggerDate.getTime() > referenceDate.getTime()
}

export const shouldScheduleMotivationEveningNotification = (input: {
  globalEnabled: boolean
  motivationSparkEnabled: boolean
  featureEnabled: boolean
  eveningNotification: boolean
  hasActiveSparks: boolean
  triggerDate: Date | null
  referenceDate?: Date
}): boolean => {
  if (!input.globalEnabled) return false
  if (!input.motivationSparkEnabled) return false
  if (!input.featureEnabled) return false
  if (!input.eveningNotification) return false
  if (!input.hasActiveSparks) return false
  if (!input.triggerDate) return false

  const referenceDate = input.referenceDate ?? new Date()
  return input.triggerDate.getTime() > referenceDate.getTime()
}
