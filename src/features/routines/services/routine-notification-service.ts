import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getTodayKey } from '@/features/quests/utils/date';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { RoutineRepository } from '@/storage/repositories/routine-repository';
import { NotificationCategory } from '@/types/notification';

import { getPeriodKey, isRoutineDueOnDate } from '../utils/routine-schedule';
import { validateReminderTime } from '../utils/routine-time-input';

const ROUTINE_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-routine-`;

const routineNotificationId = (routineId: string, dateKey: string) =>
  `${ROUTINE_PREFIX}${routineId}-${dateKey}`;

const buildTriggerDate = (dateKey: string, reminderTime: string): Date | null => {
  const parsed = validateReminderTime(reminderTime);
  if (!parsed.valid || !parsed.normalized) return null;

  const [hours, minutes] = parsed.normalized.split(':').map(Number);
  const [year, month, day] = dateKey.split('-').map(Number);
  const trigger = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (trigger.getTime() <= Date.now()) return null;
  return trigger;
};

export const RoutineNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.routineReminder) return;

    await cancelNotificationsByPrefix(ROUTINE_PREFIX);

    const todayKey = getTodayKey();
    const routines = await RoutineRepository.listActive();

    await Promise.all(
      routines.map(async (routine) => {
        if (!routine.reminderTime || !isRoutineDueOnDate(routine, todayKey)) return;

        const periodKey = getPeriodKey(routine.frequency, todayKey);
        const completion = await RoutineRepository.getCompletion(routine.id, periodKey);
        if (completion) return;

        const triggerDate = buildTriggerDate(todayKey, routine.reminderTime);
        if (!triggerDate) return;

        await scheduleLocalNotification({
          identifier: routineNotificationId(routine.id, todayKey),
          triggerDate,
          candidate: {
            category: NotificationCategory.ROUTINE_REMINDER,
            title: 'Hora da rotina',
            body: `⏰ ${routine.name} — seu lembrete de hoje.`,
            priority: 2,
          },
        });
      }),
    );
  },
};
