import { Platform } from 'react-native';

import { getPermissionStatus } from '@/features/notifications/services/notification-permissions';
import { PetEggHatchNotificationService } from '@/features/pet/services/pet-egg-hatch-notification-service';
import { PetAcademyRepository } from '@/storage/repositories/pet-academy-repository';
import { PetAdventureRepository } from '@/storage/repositories/pet-adventure-repository';
import { PetFarmRepository } from '@/storage/repositories/pet-farm-repository';
import { getOrCreatePet } from '@/storage/repositories/pet-repository';
import { NotificationPermissionStatus } from '@/types/notification';

import { PetAcademyNotificationService } from './pet-academy-notification-service';
import { PetAdventureNotificationService } from './pet-adventure-notification-service';
import { PetIncubatorNotificationService } from './pet-incubator-notification-service';

export const PetFarmNotificationSyncService = {
  async rescheduleAll(): Promise<void> {
    if (Platform.OS === 'web') return;

    const permission = await getPermissionStatus();
    if (permission !== NotificationPermissionStatus.GRANTED) return;

    const now = Date.now();
    const [adventures, academySessions, incubators, pet] = await Promise.all([
      PetAdventureRepository.listActive(),
      PetAcademyRepository.listActive(),
      PetFarmRepository.listIncubators(),
      getOrCreatePet(),
    ]);

    await Promise.all(
      adventures
        .filter((adventure) => new Date(adventure.endsAt).getTime() > now)
        .map((adventure) => PetAdventureNotificationService.scheduleReturn(adventure)),
    );

    await Promise.all(
      academySessions
        .filter((session) => new Date(session.endsAt).getTime() > now)
        .map((session) => PetAcademyNotificationService.scheduleComplete(session)),
    );

    await Promise.all(
      incubators
        .filter((egg) => new Date(egg.hatchAt).getTime() > now)
        .map((egg) => PetIncubatorNotificationService.scheduleHatch(egg)),
    );

    if (pet.isIncubating && pet.hatchAt && new Date(pet.hatchAt).getTime() > now) {
      await PetEggHatchNotificationService.schedule(pet);
    } else {
      await PetEggHatchNotificationService.cancel();
    }
  },
};
