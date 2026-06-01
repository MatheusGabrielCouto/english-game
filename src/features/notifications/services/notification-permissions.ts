import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { NotificationPermissionStatus, type NotificationPermissionStatusValue } from '@/types/notification';

export const configureNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

export const ensureAndroidChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'English Quest',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#8b5cf6',
  });
};

export const getPermissionStatus = async (): Promise<NotificationPermissionStatusValue> => {
  if (Platform.OS === 'web') {
    return NotificationPermissionStatus.UNAVAILABLE;
  }

  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return NotificationPermissionStatus.GRANTED;
  }

  if (settings.canAskAgain === false) {
    return NotificationPermissionStatus.DENIED;
  }

  return NotificationPermissionStatus.UNDETERMINED;
};

export const requestNotificationPermissions = async (): Promise<NotificationPermissionStatusValue> => {
  if (Platform.OS === 'web') {
    return NotificationPermissionStatus.UNAVAILABLE;
  }

  await ensureAndroidChannel();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return NotificationPermissionStatus.GRANTED;
  }

  const result = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  if (result.granted || result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return NotificationPermissionStatus.GRANTED;
  }

  if (result.canAskAgain === false) {
    return NotificationPermissionStatus.DENIED;
  }

  return NotificationPermissionStatus.DENIED;
};
