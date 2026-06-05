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
import type { PetAdventureEntry } from '@/types/pet-adventure';

import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';

const adventureNotificationId = (adventureId: number) =>
  `${NOTIFICATION_IDENTIFIER_PREFIX}-pet-adv-${adventureId}`;

export const PetAdventureNotificationService = {
  adventureNotificationId,

  async cancelReturn(adventureId: number): Promise<void> {
    await cancelScheduledNotification(adventureNotificationId(adventureId));
  },

  async scheduleReturn(adventure: PetAdventureEntry): Promise<void> {
    if (Platform.OS === 'web') return;

    const instance = await PetInstanceRepository.findById(adventure.instanceId);
    const name = instance?.nickname ?? 'Pet';
    const species = instance ? getSpeciesDefinition(instance.speciesKey) : null;
    const emoji = species?.emoji ?? '🐾';

    await scheduleLocalNotification({
      identifier: adventureNotificationId(adventure.id),
      triggerDate: new Date(adventure.endsAt),
      deepLinkPath: '/pet-farm/adventures',
      candidate: {
        category: NotificationCategory.PET_REMINDER,
        title: 'Aventura concluída!',
        body: `${emoji} ${name} voltou da expedição. Colete as recompensas na fazenda.`,
        priority: NOTIFICATION_PRIORITY[NotificationCategory.PET_REMINDER],
      },
    });
  },
};
