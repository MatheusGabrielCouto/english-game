import { AchievementStatus } from '@/types/achievement';
import type { NotificationContext } from '@/types/notification';

import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import { useCityStore } from '@/features/city/store/city-store';
import { useContractsStore } from '@/features/contracts/store/contracts-store';
import { PetService } from '@/features/pet/services/pet-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import { getTodayKey } from '@/features/quests/utils/date';

export const buildNotificationContext = (): NotificationContext => {
  const player = usePlayerStore.getState();
  const today = getTodayKey();
  const studiedToday = player.lastStudyDate === today;

  const activeContract = useContractsStore.getState().activeContract;
  const cityProgress = useCityStore.getState().progress;
  const achievements = useAchievementsStore.getState().achievements;

  const nearAchievement = achievements.find(
    (achievement) =>
      achievement.progress.status === AchievementStatus.IN_PROGRESS &&
      achievement.progress.percentage >= 80 &&
      achievement.progress.percentage < 100,
  );

  const pet = PetService.getCachedPet();

  return {
    studiedToday,
    lastStudyDate: player.lastStudyDate,
    currentStreak: player.currentStreak,
    shields: player.shields,
    hasActiveContract: activeContract !== null,
    contractName: activeContract?.name ?? null,
    petMood: pet?.mood ?? null,
    hasNearAchievement: nearAchievement !== undefined,
    nearAchievementName: nearAchievement?.name ?? null,
    cityLevelsUntilNext: cityProgress?.levelsUntilNext ?? null,
    nextBuildingName: cityProgress?.nextBuilding?.name ?? null,
  };
};
