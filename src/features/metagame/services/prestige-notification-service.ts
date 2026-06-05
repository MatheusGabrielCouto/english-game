import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getMetagameState } from '@/storage/repositories/metagame-repository';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import { NotificationCategory } from '@/types/notification';

import { PRESTIGE_TIERS } from '../constants/metagame-catalog';

const PRESTIGE_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-prestige-`;

const prestigeNotificationId = (level: number) => `${PRESTIGE_PREFIX}available-${level}`;

export const PrestigeNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.prestigeReminder) return;

    await cancelNotificationsByPrefix(PRESTIGE_PREFIX);

    const [state, player] = await Promise.all([getMetagameState(), getOrCreatePlayer()]);
    if (!state) return;

    const nextTier = PRESTIGE_TIERS.find((tier) => tier.level === state.prestigeLevel + 1);
    if (!nextTier || player.level < nextTier.requiredLevel) return;

    const trigger = new Date();
    trigger.setHours(settings.preferredHour, settings.preferredMinute, 0, 0);
    if (trigger.getTime() <= Date.now()) {
      trigger.setMinutes(trigger.getMinutes() + 2);
    }

    await scheduleLocalNotification({
      identifier: prestigeNotificationId(nextTier.level),
      triggerDate: trigger,
      candidate: {
        category: NotificationCategory.PRESTIGE_REMINDER,
        title: 'Prestígio disponível',
        body: `Você pode ascender para Prestígio ${nextTier.level} — ${nextTier.name}!`,
        priority: 3,
      },
    });
  },
};
