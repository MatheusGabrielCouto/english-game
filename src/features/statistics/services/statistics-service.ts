import { MOOD_CONFIG, STAGE_CONFIG } from '@/features/pet/constants';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { AchievementAnalyticsRepository } from '@/storage/repositories/achievement-analytics-repository';
import { AchievementUnlockRepository } from '@/storage/repositories/achievement-unlock-repository';
import { CityAnalyticsRepository } from '@/storage/repositories/city-analytics-repository';
import { ContractAnalyticsRepository } from '@/storage/repositories/contract-analytics-repository';
import { LootBoxAnalyticsRepository } from '@/storage/repositories/loot-box-analytics-repository';
import { MissionStatsRepository } from '@/storage/repositories/mission-stats-repository';
import { PetAnalyticsRepository } from '@/storage/repositories/pet-analytics-repository';
import { getCurrentPet } from '@/storage/repositories/pet-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import { PlayerStatisticsRepository } from '@/storage/repositories/player-statistics-repository';
import { ShieldStatsRepository } from '@/storage/repositories/shield-stats-repository';
import { StatisticsMilestoneRepository } from '@/storage/repositories/statistics-milestone-repository';
import { StatisticsMilestoneCategory } from '@/types/statistics';

import { ESTIMATED_STUDY_MINUTES_PER_DAY } from '../constants/default-statistics';
import { useStatisticsStore } from '../store/statistics-store';
import { buildStatisticsDashboard } from '../utils/metrics';
import { backfillStatisticsMilestones, recordStatisticsMilestone } from '../utils/milestones';

let listenersInitialized = false;

const refreshStore = async (): Promise<void> => {
  const [
    player,
    playerStatistics,
    shieldStats,
    missionStats,
    petAnalytics,
    pet,
    lootBoxAnalytics,
    achievementUnlocks,
    contractAnalytics,
    cityAnalytics,
    achievementAnalytics,
    milestones,
  ] = await Promise.all([
    getOrCreatePlayer(),
    PlayerStatisticsRepository.getOrCreate(),
    ShieldStatsRepository.getOrCreate(),
    MissionStatsRepository.getSnapshot(),
    PetAnalyticsRepository.getOrCreate(),
    getCurrentPet(),
    LootBoxAnalyticsRepository.getOrCreate(),
    AchievementUnlockRepository.findAll(),
    ContractAnalyticsRepository.getOrCreate(),
    CityAnalyticsRepository.getOrCreate(),
    AchievementAnalyticsRepository.getOrCreate(),
    StatisticsMilestoneRepository.findRecent(30),
  ]);

  const petMoodLabel = pet ? MOOD_CONFIG[pet.mood].label : '—';

  const dashboard = buildStatisticsDashboard({
    player,
    playerStudyMinutes: playerStatistics.totalStudyMinutes,
    shieldStats,
    missionStats,
    petAnalytics,
    petMoodLabel,
    lootBoxAnalytics,
    achievementUnlocks,
    contractAnalytics,
    cityAnalytics,
    achievementAnalyticsCoins: achievementAnalytics.totalCoinsGranted,
    milestones,
  });

  useStatisticsStore.setState({
    dashboard,
    isLoading: false,
  });
};

const reconcileStudyMinutes = async (totalStudyDays: number): Promise<void> => {
  const stats = await PlayerStatisticsRepository.getOrCreate();
  const expectedMinimum = totalStudyDays * ESTIMATED_STUDY_MINUTES_PER_DAY;

  if (stats.totalStudyMinutes < expectedMinimum) {
    await PlayerStatisticsRepository.setStudyMinutes(expectedMinimum);
  }
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  switch (event.type) {
    case 'STUDY_DAY_RECORDED': {
      await PlayerStatisticsRepository.addStudyMinutes(ESTIMATED_STUDY_MINUTES_PER_DAY);

      const studyDays = await getOrCreatePlayer();
      if (studyDays.totalStudyDays === 1) {
        await recordStatisticsMilestone({
          category: StatisticsMilestoneCategory.STUDY,
          milestoneKey: 'first_study_day',
          label: 'Primeiro dia estudado',
        });
      }

      await refreshStore();
      break;
    }
    case 'ACHIEVEMENT_UNLOCKED':
      await recordStatisticsMilestone({
        category: StatisticsMilestoneCategory.ACHIEVEMENT,
        milestoneKey: event.achievementKey,
        label: `Conquista: ${event.name}`,
      });
      await refreshStore();
      break;
    case 'TITLE_UNLOCKED':
      await recordStatisticsMilestone({
        category: StatisticsMilestoneCategory.TITLE,
        milestoneKey: event.titleKey,
        label: `Título: ${event.titleName}`,
      });
      await refreshStore();
      break;
    case 'CITY_BUILDING_UNLOCKED':
      await recordStatisticsMilestone({
        category: StatisticsMilestoneCategory.CITY,
        milestoneKey: event.buildingKey,
        label: `Construção: ${event.buildingName}`,
      });
      await refreshStore();
      break;
    case 'CONTRACT_COMPLETED':
      await recordStatisticsMilestone({
        category: StatisticsMilestoneCategory.CONTRACT,
        milestoneKey: `${event.contractKey}_${Date.now()}`,
        label: `Contrato: ${event.contractName}`,
        value: event.targetDays,
      });
      await refreshStore();
      break;
    case 'LOOT_BOX_OPENED':
      await recordStatisticsMilestone({
        category: StatisticsMilestoneCategory.LOOT_BOX,
        milestoneKey: `open_${event.result.boxId}`,
        label: `Loot Box: ${event.result.reward.label}`,
      });
      await refreshStore();
      break;
    case 'PET_STAGE_EVOLVED': {
      const stageConfig = STAGE_CONFIG[event.stage as keyof typeof STAGE_CONFIG];
      await recordStatisticsMilestone({
        category: StatisticsMilestoneCategory.PET,
        milestoneKey: event.stage,
        label: stageConfig ? `Pet evoluiu para ${stageConfig.label}` : `Pet evoluiu`,
      });
      await refreshStore();
      break;
    }
    case 'FOCUS_SESSION_COMPLETED': {
      const focusMinutes = Math.max(1, Math.round(event.focusedSeconds / 60));
      await PlayerStatisticsRepository.addStudyMinutes(focusMinutes);
      await recordStatisticsMilestone({
        category: StatisticsMilestoneCategory.STUDY,
        milestoneKey: `focus_${event.sessionId}`,
        label: `Focus Mode · +${event.rewards.xp} XP`,
        value: focusMinutes,
      });
      await refreshStore();
      break;
    }
    case 'PLAYER_LEVEL_UP':
      await recordStatisticsMilestone({
        category: StatisticsMilestoneCategory.LEVEL,
        milestoneKey: `level_${event.level}`,
        label: `Alcançou o nível ${event.level}`,
        value: event.level,
      });
      await refreshStore();
      break;
    default:
      break;
  }
};

export const StatisticsService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void handleGameEvent(event);
    });
  },

  async initialize(): Promise<void> {
    const player = await getOrCreatePlayer();
    await reconcileStudyMinutes(player.totalStudyDays);
    await backfillStatisticsMilestones();
    await refreshStore();
  },

  async refresh(): Promise<void> {
    await refreshStore();
  },
};
