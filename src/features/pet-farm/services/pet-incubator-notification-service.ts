import { Platform } from 'react-native';

import {
    NOTIFICATION_IDENTIFIER_PREFIX,
    NOTIFICATION_PRIORITY,
} from '@/features/notifications/constants/categories';
import {
    cancelScheduledNotification,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { NotificationCategory } from '@/types/notification';
import type { PetIncubatorEntry } from '@/types/pet-instance';

import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';

const incubatorNotificationId = (eggId: number) =>
  `${NOTIFICATION_IDENTIFIER_PREFIX}-pet-incubator-${eggId}`;

export const PetIncubatorNotificationService = {
  incubatorNotificationId,

  async scheduleHatch(egg: Pick<PetIncubatorEntry, 'id' | 'speciesKey' | 'hatchAt'>): Promise<void> {
    if (Platform.OS === 'web') return;

    const species = getSpeciesDefinition(egg.speciesKey);

    await scheduleLocalNotification({
      identifier: incubatorNotificationId(egg.id),
      triggerDate: new Date(egg.hatchAt),
      candidate: {
        category: NotificationCategory.PET_REMINDER,
        title: 'Ovo pronto para eclodir!',
        body: `${species.emoji} ${species.name} está pronto na incubadora da fazenda.`,
        priority: NOTIFICATION_PRIORITY[NotificationCategory.PET_REMINDER],
      },
    });
  },

  async cancelHatch(eggId: number): Promise<void> {
    await cancelScheduledNotification(incubatorNotificationId(eggId));
  },
};
