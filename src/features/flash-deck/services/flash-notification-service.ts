import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getTodayKey } from '@/features/quests/utils/date';
import { FlashDeckRepository } from '@/storage/repositories/flash-deck-repository';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { NotificationCategory } from '@/types/notification';

const FLASH_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-flash-`;

const flashDueId = (dateKey: string) => `${FLASH_PREFIX}due-${dateKey}`;

export const FlashNotificationService = {
  async rescheduleDueReminder(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.flashDue) return;

    const todayKey = getTodayKey();
    await cancelNotificationsByPrefix(FLASH_PREFIX);

    const dueCount = await FlashDeckRepository.countDue();
    if (dueCount === 0) return;

    const trigger = new Date();
    trigger.setHours(settings.preferredHour, settings.preferredMinute, 0, 0);
    if (trigger.getTime() <= Date.now()) {
      trigger.setMinutes(trigger.getMinutes() + 2);
    }

    await scheduleLocalNotification({
      identifier: flashDueId(todayKey),
      triggerDate: trigger,
      candidate: {
        category: NotificationCategory.FLASH_DUE,
        title: 'Cartas na mesa',
        body:
          dueCount === 1
            ? '1 carta esperando revisão no Baralho Vivo.'
            : `${dueCount} cartas esperando revisão no Baralho Vivo.`,
        priority: 2,
      },
    });
  },
};
