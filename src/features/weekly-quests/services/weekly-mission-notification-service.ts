import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { WeeklyMissionRepository } from '@/storage/repositories/weekly-mission-repository';
import { NotificationCategory } from '@/types/notification';

import { getWeekBounds } from '../utils/week';

const WEEKLY_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-weekly-`;

const weeklyNotificationId = (weekStart: string) => `${WEEKLY_PREFIX}${weekStart}`;

export const WeeklyMissionNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.weeklyMission) return;

    const { weekStartDate } = getWeekBounds();
    await cancelNotificationsByPrefix(WEEKLY_PREFIX);

    const missions = await WeeklyMissionRepository.findAllByWeek(weekStartDate);
    const pending = missions.filter((mission) => !mission.completed);
    if (pending.length === 0) return;

    const trigger = new Date();
    const day = trigger.getDay();
    if (day === 0) {
      trigger.setHours(18, 0, 0, 0);
    } else if (day === 6) {
      trigger.setDate(trigger.getDate() + 1);
      trigger.setHours(18, 0, 0, 0);
    } else {
      const daysUntilSunday = (7 - day) % 7 || 7;
      trigger.setDate(trigger.getDate() + daysUntilSunday);
      trigger.setHours(18, 0, 0, 0);
    }

    if (trigger.getTime() <= Date.now()) return;

    await scheduleLocalNotification({
      identifier: weeklyNotificationId(weekStartDate),
      triggerDate: trigger,
      candidate: {
        category: NotificationCategory.WEEKLY_MISSION,
        title: 'Missões semanais',
        body:
          pending.length === 1
            ? '1 missão semanal ainda aberta — a semana está acabando!'
            : `${pending.length} missões semanais ainda abertas — a semana está acabando!`,
        priority: 3,
      },
    });
  },
};
