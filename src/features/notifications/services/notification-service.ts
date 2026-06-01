import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

import { GameEvents } from '@/services/game-events';
import {
    countNotificationsSentToday,
    getCategoriesSentToday,
    getRecentNotificationHistory,
    markNotificationDelivered,
    markNotificationOpened,
    recordNotificationScheduled,
} from '@/storage/repositories/notification-history-repository';
import {
    getNotificationSettings,
    getOrCreateNotificationSettings,
    saveNotificationSettings,
} from '@/storage/repositories/notification-settings-repository';
import type { NotificationSettings } from '@/types/notification';

import { getTodayKey } from '@/features/quests/utils/date';

import { AppLogService } from '@/services/app-log-service';

import { buildNotificationContext } from '../utils/context';
import {
    buildNotificationCandidates,
    buildNotificationIdentifier,
    computeScheduleTimes,
    getDayStartIso,
    selectNotificationsForDay,
} from '../utils/scheduling';

import { useNotificationsStore } from '../store/notifications-store';
import {
    configureNotificationHandler,
    ensureAndroidChannel,
    getPermissionStatus,
    requestNotificationPermissions,
} from './notification-permissions';
import { cancelAllEqNotifications, scheduleLocalNotification } from './notification-scheduler';

let initialized = false;
let listenersAttached = false;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

const syncStoreFromDb = async (): Promise<void> => {
  const [settings, history, permissionStatus] = await Promise.all([
    getNotificationSettings(),
    getRecentNotificationHistory(10),
    getPermissionStatus(),
  ]);

  useNotificationsStore.setState({
    settings,
    history,
    permissionStatus,
    isLoading: false,
  });
};

const refreshSchedule = async (): Promise<void> => {
  if (Platform.OS === 'web') return;

  const settings = await getNotificationSettings();
  if (!settings.enabled) {
    await cancelAllEqNotifications();
    return;
  }

  const permissionStatus = await getPermissionStatus();
  if (permissionStatus !== 'granted') {
    return;
  }

  const context = buildNotificationContext();
  if (context.studiedToday) {
    await cancelAllEqNotifications();
    return;
  }

  const todayKey = getTodayKey();
  const dayStartIso = getDayStartIso(todayKey);
  const [sentCategories, sentCount] = await Promise.all([
    getCategoriesSentToday(dayStartIso),
    countNotificationsSentToday(dayStartIso),
  ]);

  const candidates = buildNotificationCandidates(context, settings, new Date().getDate());
  const selected = selectNotificationsForDay(candidates, sentCategories, sentCount);
  const scheduleTimes = computeScheduleTimes(
    settings.preferredHour,
    settings.preferredMinute,
    selected.length,
  );

  await cancelAllEqNotifications();

  for (let index = 0; index < selected.length; index += 1) {
    const candidate = selected[index];
    const triggerDate = scheduleTimes[index];
    const identifier = buildNotificationIdentifier(todayKey, candidate.category);

    if (sentCategories.includes(candidate.category)) continue;
    if (triggerDate.getTime() <= Date.now()) continue;

    await scheduleLocalNotification({ candidate, identifier, triggerDate });
    await recordNotificationScheduled({
      category: candidate.category,
      title: candidate.title,
      body: candidate.body,
      identifier,
      scheduledFor: triggerDate.toISOString(),
    });
  }

  await syncStoreFromDb();
};

const attachListeners = (): void => {
  if (listenersAttached || Platform.OS === 'web') return;
  listenersAttached = true;

  Notifications.addNotificationReceivedListener((notification) => {
    const identifier = notification.request.identifier;
    if (!identifier.startsWith('eq-')) return;
    void markNotificationDelivered(identifier).then(() => syncStoreFromDb());
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    const identifier = response.notification.request.identifier;
    if (!identifier.startsWith('eq-')) return;
    void markNotificationOpened(identifier).then(() => syncStoreFromDb());
  });

  appStateSubscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      void refreshSchedule();
    }
  });
};

const handleGameEvent = () => {
  void refreshSchedule();
};

const recoverStoreAfterInitFailure = async (): Promise<void> => {
  let settings: NotificationSettings | null = null;
  try {
    settings = await getNotificationSettings();
  } catch {
    // keep null — UI will retry via reload()
  }

  useNotificationsStore.setState({
    settings,
    history: [],
    permissionStatus: await getPermissionStatus().catch(
      () => useNotificationsStore.getState().permissionStatus,
    ),
    isLoading: false,
  });
};

export const NotificationService = {
  async initialize(): Promise<void> {
    if (initialized) {
      await syncStoreFromDb().catch(() => recoverStoreAfterInitFailure());
      return;
    }
    initialized = true;

    try {
      configureNotificationHandler();
      await ensureAndroidChannel();
      await getOrCreateNotificationSettings();
      attachListeners();
      GameEvents.subscribe((event) => {
        if (
          event.type === 'DAILY_MISSION_COMPLETED' ||
          event.type === 'STUDY_DAY_RECORDED' ||
          event.type === 'STREAK_BROKEN'
        ) {
          handleGameEvent();
        }
      });

      await syncStoreFromDb();
    } catch (error) {
      AppLogService.error('notifications.initialize.failed', 'Failed to initialize notifications', {
        message: error instanceof Error ? error.message : String(error),
      });
      await recoverStoreAfterInitFailure();
    }

    try {
      await refreshSchedule();
    } catch (error) {
      AppLogService.warn('notifications.schedule.failed', 'Could not refresh notification schedule', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  },

  refreshSchedule,

  async updateSettings(partial: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const current = await getNotificationSettings();
    const next = { ...current, ...partial };
    await saveNotificationSettings(next);
    useNotificationsStore.setState({ settings: next });
    await refreshSchedule();
    return next;
  },

  async setEnabled(enabled: boolean): Promise<void> {
    if (enabled) {
      const permission = await requestNotificationPermissions();
      useNotificationsStore.setState({ permissionStatus: permission });

      if (permission !== 'granted') {
        await NotificationService.updateSettings({ enabled: false });
        return;
      }
    } else {
      await cancelAllEqNotifications();
    }

    await NotificationService.updateSettings({ enabled });
  },

  async requestPermissions(): Promise<void> {
    const permission = await requestNotificationPermissions();
    useNotificationsStore.setState({ permissionStatus: permission });

    if (permission === 'granted') {
      await NotificationService.updateSettings({ enabled: true });
    }
  },

  async reload(): Promise<void> {
    await syncStoreFromDb();
  },
};
