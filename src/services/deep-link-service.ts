import * as Linking from 'expo-linking'
import * as Notifications from 'expo-notifications'
import { type Href, router } from 'expo-router'
import { Platform } from 'react-native'

import {
    buildAppDeepLink,
    buildNotificationDeepLink,
    resolveDeepLinkUrlToHref,
} from '@/constants/deep-link-paths'
import { routes } from '@/constants/routes'
import { AppLogService } from '@/services/app-log-service'
import { NotificationCategory } from '@/types/notification'

type NotificationData = {
  url?: string
  category?: string
  type?: string
  identifier?: string
}

let initialized = false
let listenersAttached = false
let appReady = false
let pendingHref: Href | null = null

const navigateToHref = (href: Href): void => {
  if (!appReady) {
    pendingHref = href
    return
  }

  try {
    router.push(href)
  } catch (error) {
    AppLogService.warn('deep_link.navigate.failed', 'Could not navigate to deep link', {
      href: String(href),
      message: error instanceof Error ? error.message : String(error),
    })
  }
}

const resolveNotificationHref = (data: NotificationData): Href | null => {
  if (data.url) {
    return resolveDeepLinkUrlToHref(data.url)
  }

  if (data.type === 'focus_session_end') {
    return resolveDeepLinkUrlToHref(buildAppDeepLink('/focus'))
  }

  if (data.category === 'test' || data.category === 'pet_test') {
    return routes.tabs.home
  }

  if (data.category) {
    const url = buildNotificationDeepLink(data.category)
    return resolveDeepLinkUrlToHref(url)
  }

  return null
}

const handleIncomingUrl = (rawUrl: string | null): void => {
  if (!rawUrl) return

  const href = resolveDeepLinkUrlToHref(rawUrl)
  if (!href) {
    AppLogService.warn('deep_link.unresolved', 'Unsupported deep link URL', { rawUrl })
    return
  }

  navigateToHref(href)
}

const attachListeners = (): void => {
  if (listenersAttached || Platform.OS === 'web') return
  listenersAttached = true

  Linking.addEventListener('url', ({ url }) => {
    handleIncomingUrl(url)
  })

  Notifications.addNotificationResponseReceivedListener((response) => {
    const data = (response.notification.request.content.data ?? {}) as NotificationData
    const href = resolveNotificationHref(data)
    if (href) {
      navigateToHref(href)
    }
  })
}

export const DeepLinkService = {
  init: () => {
    if (initialized) return
    initialized = true
    attachListeners()

    void Linking.getInitialURL().then((url) => {
      if (url) handleIncomingUrl(url)
    })

    if (Platform.OS !== 'web') {
      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!response) return
        const data = (response.notification.request.content.data ?? {}) as NotificationData
        const href = resolveNotificationHref(data)
        if (href) navigateToHref(href)
      })
    }
  },

  setAppReady: (ready: boolean) => {
    appReady = ready
    if (!ready || !pendingHref) return

    const href = pendingHref
    pendingHref = null
    navigateToHref(href)
  },

  openUrl: (rawUrl: string) => {
    handleIncomingUrl(rawUrl)
  },

  openCategory: (category: string) => {
    const href = resolveDeepLinkUrlToHref(buildNotificationDeepLink(category))
    if (href) navigateToHref(href)
  },

  /** Smoke-test helper for settings / QA. */
  examples: () => ({
    play: buildNotificationDeepLink(NotificationCategory.DAILY_REMINDER),
    streak: buildNotificationDeepLink(NotificationCategory.STREAK_RISK),
    city: buildAppDeepLink('/city', { poiKey: 'library', tab: 'missions' }),
  }),
}
