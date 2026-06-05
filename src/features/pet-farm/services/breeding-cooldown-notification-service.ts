import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import {
    cancelNotificationsByPrefix,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { canScheduleFeatureNotifications } from '@/features/notifications/utils/notification-gates';
import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { NotificationCategory } from '@/types/notification';

const BREEDING_PREFIX = `${NOTIFICATION_IDENTIFIER_PREFIX}-breed-cooldown-`;

const breedingNotificationId = (instanceId: number) => `${BREEDING_PREFIX}${instanceId}`;

export const BreedingCooldownNotificationService = {
  async rescheduleAll(): Promise<void> {
    if (!(await canScheduleFeatureNotifications())) return;

    const settings = await getNotificationSettings();
    if (!settings.petReminder) return;

    await cancelNotificationsByPrefix(BREEDING_PREFIX);

    const instances = await PetInstanceRepository.listAll();
    const now = Date.now();

    await Promise.all(
      instances.map(async (instance) => {
        if (!instance.breedingCooldownUntil) return;

        const readyAt = new Date(instance.breedingCooldownUntil).getTime();
        if (readyAt <= now) return;

        await scheduleLocalNotification({
          identifier: breedingNotificationId(instance.id),
          triggerDate: new Date(instance.breedingCooldownUntil),
          candidate: {
            category: NotificationCategory.BREEDING_READY,
            title: 'Cruzamento disponível',
            body: `💞 ${instance.nickname} pode cruzar de novo na fazenda.`,
            priority: 4,
          },
        });
      }),
    );
  },
};
