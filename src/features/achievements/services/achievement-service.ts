import { InventoryService } from '@/features/inventory/services/inventory-service';
import { LootBoxService } from '@/features/loot-boxes/services/loot-box-service';
import { PET_XP_REWARDS } from '@/features/pet/constants';
import { PetService } from '@/features/pet/services/pet-service';
import { PlayerService } from '@/features/player/services/player-service';
import { ShieldService } from '@/features/shields/services/shield-service';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { AchievementAnalyticsRepository } from '@/storage/repositories/achievement-analytics-repository';
import { AchievementStatsRepository } from '@/storage/repositories/achievement-stats-repository';
import { AchievementUnlockRepository } from '@/storage/repositories/achievement-unlock-repository';
import { LootBoxAnalyticsRepository } from '@/storage/repositories/loot-box-analytics-repository';
import { getCurrentPet } from '@/storage/repositories/pet-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import {
    AchievementRewardType,
    type AchievementAnalyticsRecord,
    type AchievementDefinition,
    type AchievementReward,
    type AchievementStatsRecord,
    type AchievementSummary,
    type AchievementUnlockPayload,
    type AchievementViewModel,
} from '@/types/achievement';
import { PetStage } from '@/types/pet';

import { debounceAsync } from '@/utils/debounce';

import { ACHIEVEMENT_DEFINITIONS } from '../constants/default-achievements';
import { useAchievementsStore } from '../store/achievements-store';
import { countCompletedMissions } from '../utils/mission-count';
import {
    buildAchievementProgress,
    computeLifetimeXp,
    isAchievementMet,
    type AchievementMetricsSnapshot,
} from '../utils/progress';

let listenersInitialized = false;
let unlockedKeys = new Set<string>();
let unlockDates = new Map<string, string>();
let unlockInProgress = new Set<string>();
let cachedStats: AchievementStatsRecord | null = null;
let cachedAnalytics: AchievementAnalyticsRecord | null = null;
const celebrationQueue: AchievementUnlockPayload[] = [];

const applyReward = async (reward: AchievementReward): Promise<void> => {
  switch (reward.type) {
    case AchievementRewardType.COINS:
      PlayerService.addCoins(reward.amount);
      break;
    case AchievementRewardType.SHIELD:
      await ShieldService.grantShields(reward.amount, 'achievement');
      break;
    case AchievementRewardType.LOOT_BOX:
      await LootBoxService.grantLootBox(reward.rarity, 'achievement');
      break;
    case AchievementRewardType.SPECIAL:
      await InventoryService.addSpecialItem(reward.itemKey, reward.amount, 'achievement');
      break;
    case AchievementRewardType.TITLE:
      if (reward.titleKey) {
        const { TitleService } = await import('@/features/titles/services/title-service');
        await TitleService.grantTitleByKey(reward.titleKey, true);
      }
      break;
    default:
      break;
  }
};

const buildMetricsSnapshot = async (): Promise<AchievementMetricsSnapshot> => {
  const player = await getOrCreatePlayer();
  const pet = await getCurrentPet();
  const stats = cachedStats ?? (await AchievementStatsRepository.getOrCreate());

  return {
    totalStudyDays: player.totalStudyDays,
    bestStreak: player.bestStreak,
    playerLevel: player.level,
    petStage: pet?.stage ?? PetStage.EGG,
    stats,
  };
};

const buildSummary = (viewModels: AchievementViewModel[]): AchievementSummary => {
  const unlocked = viewModels.filter((item) => item.unlockedAt !== null).length;
  const total = viewModels.length;
  const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return { unlocked, total, percentage };
};

const buildViewModels = async (): Promise<AchievementViewModel[]> => {
  const snapshot = await buildMetricsSnapshot();

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const unlockedAt = unlockDates.get(definition.key) ?? null;

    return {
      ...definition,
      unlockedAt,
      progress: buildAchievementProgress(definition, snapshot, unlockedAt),
    };
  });
};

const refreshStore = async (): Promise<void> => {
  const achievements = await buildViewModels();
  const summary = buildSummary(achievements);

  useAchievementsStore.setState({
    achievements,
    summary,
    analytics: cachedAnalytics,
    isLoading: false,
  });
};

const enqueueCelebration = (payload: AchievementUnlockPayload) => {
  celebrationQueue.push(payload);
  const current = useAchievementsStore.getState().celebration;

  if (!current) {
    useAchievementsStore.setState({ celebration: payload });
  }
};

export const dequeueCelebration = (): void => {
  celebrationQueue.shift();
  useAchievementsStore.setState({ celebration: celebrationQueue[0] ?? null });
};

const unlockAchievement = async (
  definition: AchievementDefinition,
  options: { celebrate: boolean },
): Promise<void> => {
  if (unlockedKeys.has(definition.key) || unlockInProgress.has(definition.key)) return;

  const existing = await AchievementUnlockRepository.findByKey(definition.key);
  if (existing) {
    unlockedKeys.add(definition.key);
    unlockDates.set(definition.key, existing.unlockedAt);
    return;
  }

  unlockInProgress.add(definition.key);

  try {
    const unlockedAt = new Date().toISOString();

    for (const reward of definition.rewards) {
      await applyReward(reward);
    }

    await PetService.addExperience(PET_XP_REWARDS.ACHIEVEMENT);

    const created = await AchievementUnlockRepository.create(definition.key, unlockedAt);
    if (!created) {
      const synced = await AchievementUnlockRepository.findByKey(definition.key);
      if (synced) {
        unlockedKeys.add(definition.key);
        unlockDates.set(definition.key, synced.unlockedAt);
      }
      return;
    }

    unlockedKeys.add(definition.key);
    unlockDates.set(definition.key, unlockedAt);

    cachedAnalytics = await AchievementAnalyticsRepository.recordUnlock(definition.rewards, unlockedAt);

    GameEvents.emit({
      type: 'ACHIEVEMENT_UNLOCKED',
      achievementKey: definition.key,
      name: definition.name,
      rewards: definition.rewards.map((reward) => ({ type: reward.type, label: reward.label })),
    });

    const payload: AchievementUnlockPayload = {
      achievement: definition,
      unlockedAt,
      rewards: definition.rewards,
    };

    if (options.celebrate) {
      enqueueCelebration(payload);
    }

    await refreshStore();
  } finally {
    unlockInProgress.delete(definition.key);
  }
};

const checkAllAchievements = async (celebrate: boolean): Promise<void> => {
  const snapshot = await buildMetricsSnapshot();

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    if (unlockedKeys.has(definition.key)) continue;
    if (!isAchievementMet(definition, snapshot)) continue;
    await unlockAchievement(definition, { celebrate });
  }
};

const scheduleAchievementCheck = debounceAsync(
  (celebrate: boolean) => checkAllAchievements(celebrate),
  450,
);

const reconcileStats = async (): Promise<void> => {
  const stats = await AchievementStatsRepository.getOrCreate();
  const player = await getOrCreatePlayer();
  const lootAnalytics = await LootBoxAnalyticsRepository.getOrCreate();
  const missionCount = await countCompletedMissions();
  const lifetimeXp = computeLifetimeXp(player.level, player.xp);

  const next: AchievementStatsRecord = {
    totalMissionsCompleted: Math.max(stats.totalMissionsCompleted, missionCount),
    totalXpEarned: Math.max(stats.totalXpEarned, lifetimeXp),
    totalLootBoxesOpened: Math.max(stats.totalLootBoxesOpened, lootAnalytics.totalOpened),
    totalDuelWins: stats.totalDuelWins,
    totalFlashReviews: stats.totalFlashReviews,
  };

  if (
    next.totalMissionsCompleted !== stats.totalMissionsCompleted ||
    next.totalXpEarned !== stats.totalXpEarned ||
    next.totalLootBoxesOpened !== stats.totalLootBoxesOpened ||
    next.totalDuelWins !== stats.totalDuelWins ||
    next.totalFlashReviews !== stats.totalFlashReviews
  ) {
    await AchievementStatsRepository.save(next);
  }

  cachedStats = next;
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  switch (event.type) {
    case 'DAILY_MISSION_COMPLETED':
      cachedStats = await AchievementStatsRepository.incrementMissions();
      scheduleAchievementCheck(true);
      break;
    case 'XP_GAINED':
      cachedStats = await AchievementStatsRepository.incrementXp(event.amount);
      scheduleAchievementCheck(false);
      break;
    case 'STUDY_DAY_RECORDED':
      scheduleAchievementCheck(true);
      break;
    case 'LOOT_BOX_OPENED':
      cachedStats = await AchievementStatsRepository.incrementLootBoxes();
      scheduleAchievementCheck(true);
      break;
    case 'PET_STAGE_EVOLVED':
      scheduleAchievementCheck(true);
      break;
    case 'WEEKLY_MISSION_CLAIMED':
      cachedStats = await AchievementStatsRepository.incrementMissions();
      scheduleAchievementCheck(true);
      break;
    case 'DUEL_WON':
      cachedStats = await AchievementStatsRepository.incrementDuelWins();
      scheduleAchievementCheck(true);
      break;
    case 'FLASH_SESSION_DONE':
      if (event.cardsReviewed > 0) {
        cachedStats = await AchievementStatsRepository.incrementFlashReviews(event.cardsReviewed);
        scheduleAchievementCheck(false);
      }
      break;
    default:
      break;
  }
};

export const AchievementService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;
    GameEvents.subscribe((event) => {
      void handleGameEvent(event);
    });
  },

  async initialize(): Promise<void> {
    const unlocks = await AchievementUnlockRepository.findAll();
    unlockedKeys = new Set(unlocks.map((unlock) => unlock.achievementKey));
    unlockDates = new Map(unlocks.map((unlock) => [unlock.achievementKey, unlock.unlockedAt]));

    cachedAnalytics = await AchievementAnalyticsRepository.getOrCreate();
    await reconcileStats();
    await checkAllAchievements(false);
    await refreshStore();
  },

  async refresh(): Promise<void> {
    await refreshStore();
  },

  getCachedAnalytics(): AchievementAnalyticsRecord | null {
    return cachedAnalytics;
  },

  dequeueCelebration,
};
