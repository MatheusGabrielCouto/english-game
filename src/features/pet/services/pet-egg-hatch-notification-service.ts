import { Platform } from 'react-native';

import { PET_SPECIES_BY_KEY } from '@/features/game-design/catalogs/pet-species-catalog';
import {
    NOTIFICATION_IDENTIFIER_PREFIX,
    NOTIFICATION_PRIORITY,
} from '@/features/notifications/constants/categories';
import {
    cancelScheduledNotification,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { NotificationCategory } from '@/types/notification';
import type { Pet } from '@/types/pet';

const PET_EGG_HATCH_NOTIFICATION_ID = `${NOTIFICATION_IDENTIFIER_PREFIX}-pet-egg-hatch`;

export const PetEggHatchNotificationService = {
  notificationId: PET_EGG_HATCH_NOTIFICATION_ID,

  async schedule(pet: Pick<Pet, 'hatchAt' | 'speciesKey' | 'name' | 'isIncubating'>): Promise<void> {
    if (Platform.OS === 'web') return;
    if (!pet.isIncubating || !pet.hatchAt) return;

    const species = PET_SPECIES_BY_KEY[pet.speciesKey];
    const emoji = species?.emoji ?? '🥚';
    const name = pet.name || species?.name || 'Pet';

    await scheduleLocalNotification({
      identifier: PET_EGG_HATCH_NOTIFICATION_ID,
      triggerDate: new Date(pet.hatchAt),
      candidate: {
        category: NotificationCategory.PET_REMINDER,
        title: 'Eclosão pronta!',
        body: `${emoji} ${name} está pronto para nascer no laboratório.`,
        priority: NOTIFICATION_PRIORITY[NotificationCategory.PET_REMINDER],
      },
    });
  },

  async cancel(): Promise<void> {
    await cancelScheduledNotification(PET_EGG_HATCH_NOTIFICATION_ID);
  },
};
