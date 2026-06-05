import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getTodayKey } from '@/features/quests/utils/date';
import { InventoryLootBoxRepository } from '@/storage/repositories/inventory-loot-box-repository';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { RICH_NOTIFICATION_DEFAULTS } from '@/features/notifications/constants/rich-notification-ui';
import { buildLootReminderRichVisual } from '@/features/notifications/utils/loot-rich-notification';
import { NotificationCategory } from '@/types/notification';

const LOOT_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-loot-`;

const lootNotificationId = (dateKey: string) => `${LOOT_PREFIX}${dateKey}`;

export const LootNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.lootReminder) return;

    const todayKey = getTodayKey();
    await cancelNotificationsByPrefix(LOOT_PREFIX);

    const unopened = await InventoryLootBoxRepository.findUnopened();
    if (unopened.length === 0) return;

    const trigger = new Date();
    trigger.setHours(settings.preferredHour, settings.preferredMinute, 0, 0);
    if (trigger.getTime() <= Date.now()) {
      trigger.setMinutes(trigger.getMinutes() + 2);
    }

    const rich = buildLootReminderRichVisual(unopened.map((box) => box.rarity));

    await scheduleLocalNotification({
      identifier: lootNotificationId(todayKey),
      triggerDate: trigger,
      candidate: {
        category: NotificationCategory.LOOT_REMINDER,
        title: RICH_NOTIFICATION_DEFAULTS.lootProgressTitle,
        body:
          unopened.length === 1
            ? 'Você tem 1 caixa surpresa para abrir!'
            : `Você tem ${unopened.length} caixas surpresa para abrir!`,
        priority: 5,
        rich,
      },
    });
  },
};
