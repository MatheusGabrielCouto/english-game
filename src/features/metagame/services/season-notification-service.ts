import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getMetagameState } from '@/storage/repositories/metagame-repository';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { NotificationCategory } from '@/types/notification';

import { getDaysLeftInSeason, getSeasonKey } from '../constants/metagame-catalog';
import { SeasonPassService } from './season-pass-service';

const SEASON_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-season-`;

const claimNotificationId = (seasonKey: string) => `${SEASON_PREFIX}claim-${seasonKey}`;
const endingNotificationId = (seasonKey: string) => `${SEASON_PREFIX}ending-${seasonKey}`;

export const SeasonNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.seasonReminder) return;

    const state = await getMetagameState();
    if (!state) return;

    const seasonKey = getSeasonKey();
    await cancelNotificationsByPrefix(SEASON_PREFIX);

    const claimable = SeasonPassService.countClaimable(state);
    if (claimable > 0) {
      const trigger = new Date();
      trigger.setHours(settings.preferredHour, settings.preferredMinute, 0, 0);
      if (trigger.getTime() <= Date.now()) {
        trigger.setMinutes(trigger.getMinutes() + 2);
      }

      await scheduleLocalNotification({
        identifier: claimNotificationId(seasonKey),
        triggerDate: trigger,
        candidate: {
          category: NotificationCategory.SEASON_REMINDER,
          title: 'Temporada',
          body:
            claimable === 1
              ? '1 recompensa da temporada pronta para resgatar!'
              : `${claimable} recompensas da temporada prontas para resgatar!`,
          priority: 3,
        },
      });
    }

    const daysLeft = getDaysLeftInSeason();
    if (daysLeft > 3) return;

    const endTrigger = new Date();
    endTrigger.setDate(endTrigger.getDate() + Math.max(0, daysLeft));
    endTrigger.setHours(18, 0, 0, 0);
    if (endTrigger.getTime() <= Date.now()) return;

    await scheduleLocalNotification({
      identifier: endingNotificationId(seasonKey),
      triggerDate: endTrigger,
      candidate: {
        category: NotificationCategory.SEASON_REMINDER,
        title: 'Fim da temporada',
        body:
          daysLeft <= 0
            ? 'Último dia da temporada — resgate suas recompensas!'
            : `A temporada termina em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}. Não perca suas recompensas!`,
        priority: 2,
      },
    });
  },
};
