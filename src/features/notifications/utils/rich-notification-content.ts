import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import {
  buildRichNotificationPayload,
  type RichNotificationContentInput,
  type RichNotificationVisual,
} from './rich-notification-payload'

export type { RichNotificationContentInput, RichNotificationVisual }

export const buildRichNotificationContent = (
  input: RichNotificationContentInput,
): Notifications.NotificationContentInput => {
  const payload = buildRichNotificationPayload(input)

  return {
    title: payload.title,
    subtitle: payload.subtitle,
    body: payload.body,
    sound: payload.sound,
    data: payload.data,
    ...(Platform.OS === 'android'
      ? {
          channelId: payload.android.channelId,
          color: payload.android.color,
          priority:
            payload.android.priority === 'high'
              ? Notifications.AndroidNotificationPriority.HIGH
              : Notifications.AndroidNotificationPriority.DEFAULT,
        }
      : payload.ios.interruptionLevel
        ? { interruptionLevel: payload.ios.interruptionLevel }
        : {}),
  }
}
