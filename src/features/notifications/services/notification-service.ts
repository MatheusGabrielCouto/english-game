import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

import { GameEvents, type GameEvent } from '@/services/game-events';
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
import {
    NotificationPermissionStatus,
    type NotificationSettings,
} from '@/types/notification';

import { buildAppDeepLink } from '@/constants/deep-link-paths';
import { getTodayKey } from '@/features/quests/utils/date';

import { AppLogService } from '@/services/app-log-service';

import { MAX_DAILY_NOTIFICATIONS } from '../constants/categories';
import { buildNotificationContext } from '../utils/context';
import {
    buildNotificationCandidates,
    buildNotificationIdentifier,
    buildStreakRiskCandidate,
    computeScheduleTimes,
    computeStreakRiskScheduleTime,
    getDayStartIso,
    selectNotificationsForDay,
} from '../utils/scheduling';

import { useNotificationsStore } from '../store/notifications-store';
import { FeatureNotificationSyncService } from './feature-notification-sync-service';
import {
    configureNotificationHandler,
    ensureAndroidChannel,
    getPermissionStatus,
    requestNotificationPermissions,
} from './notification-permissions';

import { cancelAllEqNotifications, scheduleLocalNotification } from './notification-scheduler';
import { tryPresentDelightFromGameEvent } from './rich-notification-service';

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

  try {
    const settings = await getNotificationSettings();
    if (!settings.enabled) {
      await cancelAllEqNotifications();
      await FeatureNotificationSyncService.cancelAll();
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

    const seed = new Date().getDate();
    const candidates = buildNotificationCandidates(context, settings, seed);
    const blockedCategories = [...sentCategories];
    let scheduledTodayCount = sentCount;

    await cancelAllEqNotifications();

    const streakRiskCandidate = buildStreakRiskCandidate(context, settings, seed);
    const streakRiskTime = computeStreakRiskScheduleTime(context, settings);

    if (
      streakRiskCandidate &&
      streakRiskTime &&
      streakRiskTime.getTime() > Date.now() &&
      !blockedCategories.includes(streakRiskCandidate.category) &&
      scheduledTodayCount < MAX_DAILY_NOTIFICATIONS
    ) {
      const streakIdentifier = buildNotificationIdentifier(todayKey, streakRiskCandidate.category);
      await scheduleLocalNotification({
        candidate: streakRiskCandidate,
        identifier: streakIdentifier,
        triggerDate: streakRiskTime,
      });
      await recordNotificationScheduled({
        category: streakRiskCandidate.category,
        title: streakRiskCandidate.title,
        body: streakRiskCandidate.body,
        identifier: streakIdentifier,
        scheduledFor: streakRiskTime.toISOString(),
      });
      blockedCategories.push(streakRiskCandidate.category);
      scheduledTodayCount += 1;
    }

    const selected = selectNotificationsForDay(candidates, blockedCategories, scheduledTodayCount);
    const scheduleTimes = computeScheduleTimes(
      settings.preferredHour,
      settings.preferredMinute,
      selected.length,
    );

    for (let index = 0; index < selected.length; index += 1) {
      const candidate = selected[index];
      const triggerDate = scheduleTimes[index];
      const identifier = buildNotificationIdentifier(todayKey, candidate.category);

      if (blockedCategories.includes(candidate.category)) continue;
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
  } finally {
    await FeatureNotificationSyncService.rescheduleAll();
  }
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

const FEATURE_RESCHEDULE_EVENTS = new Set([
  'ROUTINE_CREATED',
  'ROUTINE_COMPLETED',
  'ROUTINE_MISSED',
  'JOURNAL_ENTRY_CREATED',
  'JOURNAL_ENTRY_REVIEWED',
  'FLASH_SESSION_DONE',
  'PET_EGG_USED',
  'PET_BRED',
  'PET_ADVENTURE_STARTED',
  'PET_ADVENTURE_CLAIMED',
  'PET_ACADEMY_STARTED',
  'PET_ACADEMY_CLAIMED',
  'LOOT_BOX_RECEIVED',
  'LOOT_BOX_OPENED',
  'WEEKLY_MISSION_CLAIMED',
  'CONTRACT_STARTED',
  'CONTRACT_COMPLETED',
  'CONTRACT_FAILED',
  'DUEL_WON',
  'DUEL_LOST',
  'LEXICON_BRICK_CRACKED',
  'LEXICON_BRICK_REPAIRED',
  'SEASON_TIER_REACHED',
  'SEASON_REWARD_CLAIMED',
  'PRESTIGE_AVAILABLE',
  'PLAYER_LEVEL_UP',
]);

const STUDY_RESCHEDULE_EVENTS = new Set([
  'DAILY_MISSION_COMPLETED',
  'STUDY_DAY_RECORDED',
  'STREAK_BROKEN',
]);

const handleGameEvent = (event: GameEvent) => {
  if (event.type === 'ACHIEVEMENT_UNLOCKED' || event.type === 'LOOT_BOX_RECEIVED') {
    void tryPresentDelightFromGameEvent(event);
  }

  if (STUDY_RESCHEDULE_EVENTS.has(event.type)) {
    void refreshSchedule();
    return;
  }

  if (FEATURE_RESCHEDULE_EVENTS.has(event.type)) {
    void FeatureNotificationSyncService.rescheduleAll();
  }
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
      const settings = await getOrCreateNotificationSettings();
      let permissionStatus = await getPermissionStatus();

      if (
        settings.enabled &&
        permissionStatus === NotificationPermissionStatus.UNDETERMINED
      ) {
        permissionStatus = await requestNotificationPermissions();
      }

      attachListeners();
      GameEvents.subscribe((event) => {
        handleGameEvent(event);
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

  async getDiagnostics(): Promise<string> {
    if (Platform.OS === 'web') {
      return 'Notificações indisponíveis na web.';
    }

    const [settings, permissionStatus, scheduled] = await Promise.all([
      getNotificationSettings(),
      getPermissionStatus(),
      Notifications.getAllScheduledNotificationsAsync(),
    ]);

    const studyScheduled = scheduled.filter((item) =>
      /^eq-\d{4}-\d{2}-\d{2}-/.test(item.identifier),
    );
    const featureScheduled = scheduled.filter(
      (item) =>
        !/^eq-\d{4}-\d{2}-\d{2}-/.test(item.identifier) && item.identifier.startsWith('eq-'),
    );
    const context = buildNotificationContext();
    const lines = [
      `Permissão: ${permissionStatus}`,
      `Lembretes ativos: ${settings.enabled ? 'sim' : 'não'}`,
      `Agendadas (estudo): ${studyScheduled.length}`,
      `Agendadas (funcionalidades): ${featureScheduled.length}`,
      `Estudou hoje: ${context.studiedToday ? 'sim (lembretes de estudo pausados)' : 'não'}`,
      `Horário preferido: ${String(settings.preferredHour).padStart(2, '0')}:${String(settings.preferredMinute).padStart(2, '0')}`,
    ];

    return lines.join('\n');
  },

  async sendTestNotification(): Promise<{ ok: boolean; message: string }> {
    if (Platform.OS === 'web') {
      return { ok: false, message: 'Notificações indisponíveis na web.' };
    }

    const permission = await requestNotificationPermissions();
    useNotificationsStore.setState({ permissionStatus: permission });

    if (permission !== NotificationPermissionStatus.GRANTED) {
      return {
        ok: false,
        message: 'Permissão negada. Ative notificações nas configurações do sistema.',
      };
    }

    await ensureAndroidChannel();

    const identifier = `eq-test-${Date.now()}`;
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'English Quest — Teste',
        body: 'Se você está vendo isto, as notificações estão funcionando! 🔔',
        sound: true,
        data: { category: 'test', identifier, url: buildAppDeepLink('/play') },
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });

    const diagnostics = await NotificationService.getDiagnostics();

    return {
      ok: true,
      message: `Notificação de teste em ~3 segundos. Minimize o app para ver melhor.\n\n${diagnostics}`,
    };
  },

  async sendPetFarmTestNotification(): Promise<{ ok: boolean; message: string }> {
    if (Platform.OS === 'web') {
      return { ok: false, message: 'Notificações indisponíveis na web.' };
    }

    const permission = await requestNotificationPermissions();
    useNotificationsStore.setState({ permissionStatus: permission });

    if (permission !== NotificationPermissionStatus.GRANTED) {
      return {
        ok: false,
        message: 'Permissão negada. Ative notificações nas configurações do sistema.',
      };
    }

    await ensureAndroidChannel();

    const identifier = `eq-test-pet-${Date.now()}`;
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: 'Aventura concluída! (teste)',
        body: '🐾 Seu pet voltou da expedição. Colete as recompensas na fazenda.',
        sound: true,
        data: {
          category: 'pet_test',
          identifier,
          url: buildAppDeepLink('/pet-farm/adventures'),
        },
        ...(Platform.OS === 'android' ? { channelId: 'default' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3,
      },
    });

    await FeatureNotificationSyncService.rescheduleAll();

    const diagnostics = await NotificationService.getDiagnostics();

    return {
      ok: true,
      message: `Notificação da fazenda em ~3 segundos. Reagendamos aventuras, academia e incubação ativas.\n\n${diagnostics}`,
    };
  },
};
