import { Platform } from 'react-native';

import {
    NOTIFICATION_IDENTIFIER_PREFIX,
    NOTIFICATION_PRIORITY,
} from '@/features/notifications/constants/categories';
import {
    cancelScheduledNotification,
    scheduleLocalNotification,
} from '@/features/notifications/services/notification-scheduler';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { NotificationCategory } from '@/types/notification';
import type { PetAcademyEntry } from '@/types/pet-academy';

import { PET_ACADEMY_TRACK_BY_KEY } from '../catalogs/pet-academy-catalog';
import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';

const academyNotificationId = (sessionId: number) =>
  `${NOTIFICATION_IDENTIFIER_PREFIX}-pet-academy-${sessionId}`;

export const PetAcademyNotificationService = {
  academyNotificationId,

  async cancelComplete(sessionId: number): Promise<void> {
    await cancelScheduledNotification(academyNotificationId(sessionId));
  },

  async scheduleComplete(session: PetAcademyEntry): Promise<void> {
    if (Platform.OS === 'web') return;

    const instance = await PetInstanceRepository.findById(session.instanceId);
    const name = instance?.nickname ?? 'Pet';
    const species = instance ? getSpeciesDefinition(instance.speciesKey) : null;
    const emoji = species?.emoji ?? '🐾';
    const track = PET_ACADEMY_TRACK_BY_KEY[session.trackKey];

    await scheduleLocalNotification({
      identifier: academyNotificationId(session.id),
      triggerDate: new Date(session.endsAt),
      deepLinkPath: '/pet-farm/academy',
      candidate: {
        category: NotificationCategory.PET_REMINDER,
        title: 'Aula concluída!',
        body: `${emoji} ${name} terminou ${track?.label ?? 'a aula'}. Colete na Academia.`,
        priority: NOTIFICATION_PRIORITY[NotificationCategory.PET_REMINDER],
      },
    });
  },
};
