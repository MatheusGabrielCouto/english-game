import { create } from 'zustand';

import {
  NotificationPermissionStatus,
  type NotificationHistoryRecord,
  type NotificationPermissionStatusValue,
  type NotificationSettings,
} from '@/types/notification';

type NotificationsState = {
  settings: NotificationSettings | null;
  history: NotificationHistoryRecord[];
  permissionStatus: NotificationPermissionStatusValue;
  isLoading: boolean;
};

export const useNotificationsStore = create<NotificationsState>()(() => ({
  settings: null,
  history: [],
  permissionStatus: NotificationPermissionStatus.UNDETERMINED,
  isLoading: true,
}));
