import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getWeekBounds } from '@/features/weekly-quests/utils/week';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { NotificationCategory } from '@/types/notification';

import { DuelWeeklyBossService } from './duel-weekly-boss-service';

const DUEL_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-duel-`;

const parseDateKey = (dateKey: string): Date => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const DuelWeeklyBossNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.duelReminder) return;

    const status = await DuelWeeklyBossService.getStatus();
    await cancelNotificationsByPrefix(DUEL_PREFIX);

    if (status.defeatedThisWeek) return;

    const { weekStartDate, weekEndDate } = getWeekBounds();
    const monday = parseDateKey(weekStartDate);
    monday.setHours(10, 0, 0, 0);

    const sunday = parseDateKey(weekEndDate);
    sunday.setHours(18, 0, 0, 0);

    const slots = [
      {
        id: `${DUEL_PREFIX}monday-${weekStartDate}`,
        trigger: monday,
        body: 'O Guardião Lexicon da semana te espera na arena de duelos!',
      },
      {
        id: `${DUEL_PREFIX}sunday-${weekStartDate}`,
        trigger: sunday,
        body: 'Última chance de derrotar o boss semanal na arena!',
      },
    ];

    await Promise.all(
      slots.map(async (slot) => {
        if (slot.trigger.getTime() <= Date.now()) return;

        await scheduleLocalNotification({
          identifier: slot.id,
          triggerDate: slot.trigger,
          candidate: {
            category: NotificationCategory.DUEL_BOSS,
            title: 'Boss semanal',
            body: slot.body,
            priority: 3,
          },
        });
      }),
    );
  },
};
