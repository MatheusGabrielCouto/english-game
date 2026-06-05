import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { usePlayerStore } from '@/features/player/store/player-store';
import { resetDailyMissionsInDatabase } from '@/features/quests/services/reset-daily-missions';
import { getTodayKey } from '@/features/quests/utils/date';
import { getMissionsByDate } from '@/storage/repositories/missions-repository';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { NotificationCategory } from '@/types/notification';

const QUESTS_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-daily-quests-`;

const questsNotificationId = (dateKey: string) => `${QUESTS_PREFIX}${dateKey}`;

export const DailyQuestsNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.dailyReminder) return;

    const todayKey = getTodayKey();
    const studiedToday = usePlayerStore.getState().lastStudyDate === todayKey;
    if (studiedToday) {
      await cancelNotificationsByPrefix(QUESTS_PREFIX);
      return;
    }

    await cancelNotificationsByPrefix(QUESTS_PREFIX);

    let missions = await getMissionsByDate(todayKey);
    if (missions.length === 0) {
      const reset = await resetDailyMissionsInDatabase();
      missions = reset.missions;
    }
    const pending = missions.filter((mission) => !mission.completed);
    if (pending.length === 0) return;

    const trigger = new Date();
    trigger.setHours(20, 0, 0, 0);
    if (trigger.getTime() <= Date.now()) return;

    await scheduleLocalNotification({
      identifier: questsNotificationId(todayKey),
      triggerDate: trigger,
      candidate: {
        category: NotificationCategory.DAILY_QUESTS,
        title: 'Missões diárias',
        body:
          pending.length === 1
            ? '1 missão diária ainda pendente hoje.'
            : `${pending.length} missões diárias ainda pendentes hoje.`,
        priority: 4,
      },
    });
  },
};
