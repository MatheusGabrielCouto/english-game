import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { buildAppDeepLink } from '@/constants/deep-link-paths';
import type { FocusSession } from '@/types/focus-mode';

import { FOCUS_MESSAGES, FOCUS_STUDY_TYPE_META } from '../constants/focus-config';
import { getSessionEndsAtMs } from '../utils/focus-session-clock';

export const FOCUS_SESSION_NOTIFICATION_PREFIX = 'focus-session-end-';

let focusListenersAttached = false;

const ensureFocusNotificationChannel = async (): Promise<void> => {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('focus-session', {
    name: 'Modo foco',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 400, 200, 400],
    lightColor: '#8b5cf6',
  });
};

export const buildFocusSessionNotificationId = (sessionId: number): string =>
  `${FOCUS_SESSION_NOTIFICATION_PREFIX}${sessionId}`;

export const scheduleFocusSessionEndNotification = async (session: FocusSession): Promise<void> => {
  if (Platform.OS === 'web') return;

  const permission = await Notifications.getPermissionsAsync();
  if (!permission.granted) {
    const requested = await Notifications.requestPermissionsAsync();
    if (!requested.granted) return;
  }

  const triggerDate = new Date(getSessionEndsAtMs(session));
  if (triggerDate.getTime() <= Date.now()) return;

  await ensureFocusNotificationChannel();
  const identifier = buildFocusSessionNotificationId(session.id);
  await Notifications.cancelScheduledNotificationAsync(identifier).catch(() => {});

  const studyLabel = FOCUS_STUDY_TYPE_META[session.studyType].label;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: FOCUS_MESSAGES.sessionEndNotificationTitle,
      body: FOCUS_MESSAGES.sessionEndNotificationBody(studyLabel),
      data: {
        type: 'focus_session_end',
        sessionId: session.id,
        url: buildAppDeepLink('/focus'),
      },
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: 'focus-session' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
};

export const cancelFocusSessionEndNotification = async (sessionId: number): Promise<void> => {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(buildFocusSessionNotificationId(sessionId)).catch(
    () => {},
  );
};

export type FocusSessionEndNotificationHandler = (sessionId: number) => void;

export const attachFocusSessionNotificationListeners = (
  onSessionEnd: FocusSessionEndNotificationHandler,
): void => {
  if (focusListenersAttached || Platform.OS === 'web') return;
  focusListenersAttached = true;

  const handleFocusEnd = (identifier: string) => {
    if (!identifier.startsWith(FOCUS_SESSION_NOTIFICATION_PREFIX)) return;
    const sessionId = Number(identifier.slice(FOCUS_SESSION_NOTIFICATION_PREFIX.length));
    if (!Number.isFinite(sessionId)) return;
    onSessionEnd(sessionId);
  };

  Notifications.addNotificationReceivedListener((notification) => {
    handleFocusEnd(notification.request.identifier);
  });

  Notifications.addNotificationResponseReceivedListener((response) => {
    handleFocusEnd(response.notification.request.identifier);
  });
};
