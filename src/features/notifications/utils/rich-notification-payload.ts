import { buildNotificationDeepLink, type DeepLinkQuery } from '@/constants/deep-link-paths'
import type { NotificationCategoryValue } from '@/types/notification'

import {
    ANDROID_DELIGHT_CHANNEL_ID,
    RICH_ACHIEVEMENT_ANDROID_COLOR,
} from '../constants/rich-notification-ui'

export type RichNotificationVisual = {
  heroEmoji: string
  accentColor?: string
  imageUri?: string
  tagline?: string
}

export type RichNotificationContentInput = {
  category: NotificationCategoryValue | string
  title: string
  body: string
  identifier: string
  rich?: RichNotificationVisual
  deepLinkPath?: string
  deepLinkQuery?: DeepLinkQuery
  delight?: boolean
}

export type RichNotificationPayload = {
  title: string
  subtitle: string | null
  body: string
  sound: true
  data: {
    category: string
    identifier: string
    url: string
    heroEmoji: string | null
    rich: true
  }
  android: {
    channelId: string
    color: string
    priority: 'default' | 'high'
  }
  ios: {
    interruptionLevel?: 'active'
  }
}

export const buildRichNotificationPayload = (
  input: RichNotificationContentInput,
): RichNotificationPayload => {
  const heroEmoji = input.rich?.heroEmoji
  const tagline = input.rich?.tagline?.trim()
  const url = buildNotificationDeepLink(input.category, {
    path: input.deepLinkPath,
    query: input.deepLinkQuery,
  })

  const accentColor = input.rich?.accentColor ?? RICH_ACHIEVEMENT_ANDROID_COLOR
  const useDelightChannel = input.delight === true

  return {
    title: input.title,
    subtitle: tagline ?? heroEmoji ?? null,
    body: input.body,
    sound: true,
    data: {
      category: input.category,
      identifier: input.identifier,
      url,
      heroEmoji: heroEmoji ?? null,
      rich: true,
    },
    android: {
      channelId: useDelightChannel ? ANDROID_DELIGHT_CHANNEL_ID : 'default',
      color: accentColor,
      priority: useDelightChannel ? 'high' : 'default',
    },
    ios: useDelightChannel ? { interruptionLevel: 'active' } : {},
  }
}
