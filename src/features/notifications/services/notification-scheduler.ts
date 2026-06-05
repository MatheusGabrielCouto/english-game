import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { DeepLinkQuery } from '@/constants/deep-link-paths';
import type { NotificationCandidate } from '@/types/notification';

import { NotificationPermissionStatus } from '@/types/notification';
import { isStudyReminderIdentifier } from '../constants/categories';
import { buildRichNotificationContent } from '../utils/rich-notification-content';
import { ensureAndroidChannels, getPermissionStatus } from './notification-permissions';

export const cancelAllEqNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((item) => isStudyReminderIdentifier(item.identifier))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
};

export const cancelScheduledNotification = async (identifier: string): Promise<void> => {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});
};

export const cancelNotificationsByPrefix = async (prefix: string): Promise<void> => {
  if (Platform.OS === 'web') return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(prefix))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
};

export const scheduleLocalNotification = async (input: {
  candidate: NotificationCandidate;
  identifier: string;
  triggerDate: Date;
  deepLinkPath?: string;
  deepLinkQuery?: DeepLinkQuery;
}): Promise<boolean> => {
  if (Platform.OS === 'web') return false;
  if (input.triggerDate.getTime() <= Date.now()) return false;

  const permission = await getPermissionStatus();
  if (permission !== NotificationPermissionStatus.GRANTED) return false;

  await ensureAndroidChannels();

  await Notifications.scheduleNotificationAsync({
    identifier: input.identifier,
    content: buildRichNotificationContent({
      category: input.candidate.category,
      title: input.candidate.title,
      body: input.candidate.body,
      identifier: input.identifier,
      rich: input.candidate.rich,
      deepLinkPath: input.deepLinkPath,
      deepLinkQuery: input.deepLinkQuery,
      delight: Boolean(input.candidate.rich),
    }),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.triggerDate,
    },
  });

  return true;
};
