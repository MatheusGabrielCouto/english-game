import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getTodayKey } from '@/features/quests/utils/date';
import { LexiconBrickRepository } from '@/storage/repositories/lexicon-brick-repository';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { NotificationCategory } from '@/types/notification';

import { BRICK_DECAY_CRACKED_STAGE } from '../constants/memory-wall-config';

const LEXICON_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-lexicon-`;

const brickNotificationId = (brickId: string) => `${LEXICON_PREFIX}brick-${brickId}`;
const crackedSummaryId = (dateKey: string) => `${LEXICON_PREFIX}cracked-${dateKey}`;

export const LexiconNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.lexiconReminder) return;

    await cancelNotificationsByPrefix(LEXICON_PREFIX);

    const bricks = await LexiconBrickRepository.listAll();
    const now = Date.now();
    const cracked = bricks.filter((brick) => brick.decayStage >= BRICK_DECAY_CRACKED_STAGE);

    for (const brick of bricks) {
      if (brick.decayStage >= BRICK_DECAY_CRACKED_STAGE) continue;
      if (!brick.nextReviewAt) continue;

      const reviewAt = new Date(brick.nextReviewAt).getTime();
      if (reviewAt <= now) continue;

      await scheduleLocalNotification({
        identifier: brickNotificationId(brick.brickId),
        triggerDate: new Date(brick.nextReviewAt),
        candidate: {
          category: NotificationCategory.LEXICON_REMINDER,
          title: 'Mural Lexicon',
          body: brick.placedPoiKey
            ? `Reforce a palavra "${brick.lemma}" no mural da cidade.`
            : `Palavra "${brick.lemma}" precisa de reforço no cofre lexicon.`,
          priority: 3,
        },
      });
    }

    if (cracked.length === 0) return;

    const trigger = new Date();
    trigger.setHours(settings.preferredHour, settings.preferredMinute, 0, 0);
    if (trigger.getTime() <= Date.now()) {
      trigger.setMinutes(trigger.getMinutes() + 2);
    }

    const sample = cracked[0];
    await scheduleLocalNotification({
      identifier: crackedSummaryId(getTodayKey()),
      triggerDate: trigger,
      candidate: {
        category: NotificationCategory.LEXICON_REMINDER,
        title: 'Tijolos rachando!',
        body:
          cracked.length === 1
            ? `⚠️ "${sample.lemma}" está rachando — repare antes que quebre!`
            : `⚠️ ${cracked.length} palavras estão rachando no mural. Repare antes que quebrem!`,
        priority: 2,
      },
    });
  },
};
