import { Platform } from 'react-native';

import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { FlashDeckRepository } from '@/storage/repositories/flash-deck-repository';

import { scheduleLocalNotification } from '@/features/notifications/services/notification-scheduler';
import { getPermissionStatus } from '@/features/notifications/services/notification-permissions';
import { NotificationCategory } from '@/types/notification';

const FLASH_DUE_IDENTIFIER = 'eq-flash-due-reminder';

export const FlashNotificationService = {
  async rescheduleDueReminder(): Promise<void> {
    if (Platform.OS === 'web') return;

    const [settings, permission, dueCount] = await Promise.all([
      getNotificationSettings(),
      getPermissionStatus(),
      FlashDeckRepository.countDue(),
    ]);

    if (!settings.enabled || permission !== 'granted' || dueCount === 0) {
      return;
    }

    const trigger = new Date();
    trigger.setDate(trigger.getDate() + 1);
    trigger.setHours(settings.preferredHour, settings.preferredMinute, 0, 0);

    if (trigger.getTime() <= Date.now()) return;

    await scheduleLocalNotification({
      identifier: FLASH_DUE_IDENTIFIER,
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
