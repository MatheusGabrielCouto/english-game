import { Platform } from 'react-native';

import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { NotificationPermissionStatus } from '@/types/notification';

import { getPermissionStatus } from '../services/notification-permissions';

export const canScheduleFeatureNotifications = async (): Promise<boolean> => {
  if (Platform.OS === 'web') return false;

  const [settings, permission] = await Promise.all([
    getNotificationSettings(),
    getPermissionStatus(),
  ]);

  return settings.enabled && permission === NotificationPermissionStatus.GRANTED;
};
