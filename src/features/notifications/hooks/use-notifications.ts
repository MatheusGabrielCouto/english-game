import { useCallback, useEffect } from 'react';

import type { NotificationSettings } from '@/types/notification';

import { NotificationService } from '../services/notification-service';
import { useNotificationsStore } from '../store/notifications-store';

export const useNotifications = () => {
  const settings = useNotificationsStore((state) => state.settings);
  const history = useNotificationsStore((state) => state.history);
  const permissionStatus = useNotificationsStore((state) => state.permissionStatus);
  const isLoading = useNotificationsStore((state) => state.isLoading);

  const setEnabled = useCallback(async (enabled: boolean) => {
    await NotificationService.setEnabled(enabled);
  }, []);

  const requestPermissions = useCallback(async () => {
    await NotificationService.requestPermissions();
  }, []);

  const updateSettings = useCallback(async (partial: Partial<NotificationSettings>) => {
    await NotificationService.updateSettings(partial);
  }, []);

  useEffect(() => {
    if (!settings) {
      void NotificationService.initialize();
    }
  }, [settings]);

  return {
    settings,
    history,
    permissionStatus,
    isLoading,
    setEnabled,
    requestPermissions,
    updateSettings,
  };
};
