import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getTodayKey } from '@/features/quests/utils/date';
import { JournalRepository } from '@/storage/repositories/journal-repository';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { NotificationCategory } from '@/types/notification';

const JOURNAL_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-journal-`;

const entryNotificationId = (entryId: string) => `${JOURNAL_PREFIX}${entryId}`;
const dailySummaryId = (dateKey: string) => `${JOURNAL_PREFIX}daily-${dateKey}`;

export const JournalNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.journalReview) return;

    await cancelNotificationsByPrefix(JOURNAL_PREFIX);

    const entries = await JournalRepository.listActive();
    const now = Date.now();
    const todayKey = getTodayKey();

    let dueCount = 0;

    for (const entry of entries) {
      if (!entry.nextReviewAt) continue;

      const reviewAt = new Date(entry.nextReviewAt).getTime();
      if (reviewAt <= now) {
        dueCount += 1;
        continue;
      }

      await scheduleLocalNotification({
        identifier: entryNotificationId(entry.id),
        triggerDate: new Date(entry.nextReviewAt),
        candidate: {
          category: NotificationCategory.JOURNAL_REVIEW,
          title: 'Revisão do cofre',
          body: `📓 Hora de revisar "${entry.title}".`,
          priority: 3,
        },
      });
    }

    const dueReviews = await JournalRepository.listDueReviews();
    dueCount = Math.max(dueCount, dueReviews.length);

    if (dueCount === 0) return;

    const summaryTrigger = new Date();
    summaryTrigger.setHours(settings.preferredHour, settings.preferredMinute, 0, 0);
    if (summaryTrigger.getTime() <= Date.now()) {
      summaryTrigger.setMinutes(summaryTrigger.getMinutes() + 2);
    }

    await scheduleLocalNotification({
      identifier: dailySummaryId(todayKey),
      triggerDate: summaryTrigger,
      candidate: {
        category: NotificationCategory.JOURNAL_REVIEW,
        title: 'Cofre de conhecimento',
        body:
          dueCount === 1
            ? '1 nota esperando revisão no English Knowledge Vault.'
            : `${dueCount} notas esperando revisão no English Knowledge Vault.`,
        priority: 4,
      },
    });
  },
};
