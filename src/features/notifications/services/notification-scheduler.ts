import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationCandidate } from '@/types/notification';

import { NOTIFICATION_IDENTIFIER_PREFIX } from '../constants/categories';

export const cancelAllEqNotifications = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();

  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(NOTIFICATION_IDENTIFIER_PREFIX))
      .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier)),
  );
};

export const scheduleLocalNotification = async (input: {
  candidate: NotificationCandidate;
  identifier: string;
  triggerDate: Date;
}): Promise<void> => {
  if (Platform.OS === 'web') return;
  if (input.triggerDate.getTime() <= Date.now()) return;

  await Notifications.scheduleNotificationAsync({
    identifier: input.identifier,
    content: {
      title: input.candidate.title,
      body: input.candidate.body,
      data: {
        category: input.candidate.category,
        identifier: input.identifier,
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: input.triggerDate,
    },
  });
};
