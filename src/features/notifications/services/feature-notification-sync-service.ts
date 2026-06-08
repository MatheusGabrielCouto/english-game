import { Platform } from 'react-native';

import { LexiconNotificationService } from '@/features/city/services/lexicon-notification-service';
import { DuelWeeklyBossNotificationService } from '@/features/duels/services/duel-weekly-boss-notification-service';
import { JournalNotificationService } from '@/features/english-journal/services/journal-notification-service';
import { FlashNotificationService } from '@/features/flash-deck/services/flash-notification-service';
import { LootNotificationService } from '@/features/inventory/services/loot-notification-service';
import { PrestigeNotificationService } from '@/features/metagame/services/prestige-notification-service';
import { SeasonNotificationService } from '@/features/metagame/services/season-notification-service';
import { NOTIFICATION_IDENTIFIER_PREFIX } from '@/features/notifications/constants/categories';
import { cancelNotificationsByPrefix } from '@/features/notifications/services/notification-scheduler';
import { BreedingCooldownNotificationService } from '@/features/pet-farm/services/breeding-cooldown-notification-service';
import { PetFarmNotificationSyncService } from '@/features/pet-farm/services/pet-farm-notification-sync-service';
import { RoutineNotificationService } from '@/features/routines/services/routine-notification-service';
import { ShopOfferNotificationService } from '@/features/shop/services/shop-offer-notification-service';
import { WeeklyMissionNotificationService } from '@/features/weekly-quests/services/weekly-mission-notification-service';

import { getNotificationSettings } from '@/storage/repositories/notification-settings-repository';

import { MotivationNotificationService } from '@/features/motivation-spark/services/motivation-notification-service';

import { DailyQuestsNotificationService } from './daily-quests-notification-service';

const FEATURE_PREFIXES = [
  `${NOTIFICATION_IDENTIFIER_PREFIX}-routine-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-journal-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-flash-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-weekly-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-loot-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-breed-cooldown-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-daily-quests-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-pet-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-duel-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-lexicon-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-season-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-prestige-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-shop-offer-`,
  `${NOTIFICATION_IDENTIFIER_PREFIX}-motivation-`,
] as const;

export const FeatureNotificationSyncService = {
  async cancelAll(): Promise<void> {
    if (Platform.OS === 'web') return;
    await Promise.all(FEATURE_PREFIXES.map((prefix) => cancelNotificationsByPrefix(prefix)));
  },

  async rescheduleAll(): Promise<void> {
    if (Platform.OS === 'web') return;

    const settings = await getNotificationSettings();
    if (!settings.enabled) {
      await FeatureNotificationSyncService.cancelAll();
      return;
    }

    await Promise.all([
      PetFarmNotificationSyncService.rescheduleAll(),
      RoutineNotificationService.rescheduleAll(),
      JournalNotificationService.rescheduleAll(),
      FlashNotificationService.rescheduleDueReminder(),
      WeeklyMissionNotificationService.rescheduleAll(),
      LootNotificationService.rescheduleAll(),
      BreedingCooldownNotificationService.rescheduleAll(),
      DailyQuestsNotificationService.rescheduleAll(),
      DuelWeeklyBossNotificationService.rescheduleAll(),
      LexiconNotificationService.rescheduleAll(),
      SeasonNotificationService.rescheduleAll(),
      PrestigeNotificationService.rescheduleAll(),
      ShopOfferNotificationService.rescheduleAll(),
      MotivationNotificationService.rescheduleAll(),
    ]);
  },
};
