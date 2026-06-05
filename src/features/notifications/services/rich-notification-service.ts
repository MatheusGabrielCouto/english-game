import * as Notifications from 'expo-notifications'
import { AppState, Platform } from 'react-native'

import type { GameEvent } from '@/services/game-events'
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository'
import { NotificationPermissionStatus } from '@/types/notification'

import { buildRichNotificationContent } from '../utils/rich-notification-content'
import type { RichNotificationContentInput } from '../utils/rich-notification-payload'
import { resolveDelightFromGameEvent } from '../utils/rich-notification-delight'
import { ensureAndroidChannels, getPermissionStatus } from './notification-permissions'

export const shouldPresentDelightNotification = (): boolean => {
  if (Platform.OS === 'web') return false
  const state = AppState.currentState
  return state === 'background' || state === 'inactive'
}

const canPresentRichNotification = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false

  const [settings, permission] = await Promise.all([
    getNotificationSettings(),
    getPermissionStatus(),
  ])

  return settings.enabled && permission === NotificationPermissionStatus.GRANTED
}

export const presentRichNotification = async (
  input: RichNotificationContentInput,
): Promise<boolean> => {
  if (!(await canPresentRichNotification())) return false

  await ensureAndroidChannels()

  await Notifications.presentNotificationAsync({
    identifier: input.identifier,
    content: buildRichNotificationContent(input),
  })

  return true
}

export const tryPresentDelightFromGameEvent = async (event: GameEvent): Promise<void> => {
  if (!shouldPresentDelightNotification()) return

  const identifier = `eq-delight-${event.type.toLowerCase()}-${Date.now()}`
  const payload = resolveDelightFromGameEvent(event, identifier)
  if (!payload) return

  await presentRichNotification(payload)
}
