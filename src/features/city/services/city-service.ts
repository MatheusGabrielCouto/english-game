import { getBuildingConstructionCost } from '@/features/city/constants/balance-buildings';
import { PlayerService } from '@/features/player/services/player-service';
import { StudyPointsService } from '@/features/study-points/services/study-points-service';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityAnalyticsRepository } from '@/storage/repositories/city-analytics-repository';
import { CityBuildingUnlockRepository } from '@/storage/repositories/city-building-unlock-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import type {
    CityAnalyticsRecord,
    CityBuildingDefinition,
    CityBuildingViewModel,
    CitySummary,
    CityUnlockPayload,
} from '@/types/city';

import { BUILDING_DEFINITIONS } from '../constants/default-buildings';
import { useCityStore } from '../store/city-store';
import {
    buildCityProgress,
    getEligibleBuildings,
    resolveBuildingForLevel,
    sortBuildingsByLevel,
} from '../utils/progress';

let listenersInitialized = false;
let unlockedKeys = new Set<string>();
let unlockDates = new Map<string, string>();
let cachedAnalytics: CityAnalyticsRecord | null = null;
const celebrationQueue: CityUnlockPayload[] = [];

const enqueueCelebration = (payload: CityUnlockPayload) => {
  celebrationQueue.push(payload);
  const current = useCityStore.getState().celebration;

  if (!current) {
    useCityStore.setState({ celebration: payload });
  }
};

export const dequeueCityCelebration = (): void => {
  celebrationQueue.shift();
  useCityStore.setState({ celebration: celebrationQueue[0] ?? null });
};

const buildViewModels = (activeBuildingKey: string): CityBuildingViewModel[] =>
  BUILDING_DEFINITIONS.map((building) => ({
    ...building,
    unlockedAt: unlockDates.get(building.key) ?? null,
    isActive: building.key === activeBuildingKey,
  }));

const buildSummary = (activeBuildingKey: string): CitySummary => ({
  unlocked: unlockedKeys.size,
  total: BUILDING_DEFINITIONS.length,
  currentBuildingKey: activeBuildingKey,
});

const refreshStore = async (level: number): Promise<void> => {
  const activeBuilding = resolveBuildingForLevel(level);

  useCityStore.setState({
    buildings: buildViewModels(activeBuilding.key),
    summary: buildSummary(activeBuilding.key),
    progress: buildCityProgress(level),
    analytics: cachedAnalytics,
    isLoading: false,
  });
};

const unlockBuilding = async (
  building: CityBuildingDefinition,
  level: number,
  options: { celebrate: boolean },
): Promise<boolean> => {
  if (unlockedKeys.has(building.key)) return true;

  const cost = getBuildingConstructionCost(building);
  if (cost.coins > 0 && !PlayerService.removeCoins(cost.coins)) {
    return false;
  }

  if (cost.studyPoints > 0) {
    const spent = await StudyPointsService.spend(
      cost.studyPoints,
      `Construção: ${building.name}`,
      'city_build',
    );
    if (!spent) {
      if (cost.coins > 0) PlayerService.addCoins(cost.coins);
      return false;
    }
  }

  const unlockedAt = new Date().toISOString();

  await CityBuildingUnlockRepository.create({
    buildingKey: building.key,
    unlockedAt,
    levelAtUnlock: level,
  });

  unlockedKeys.add(building.key);
  unlockDates.set(building.key, unlockedAt);

  cachedAnalytics = await CityAnalyticsRepository.recordUnlock(
    building.key,
    unlockedKeys.size,
    unlockedAt,
  );

  GameEvents.emit({
    type: 'CITY_BUILDING_UNLOCKED',
    buildingKey: building.key,
    buildingName: building.name,
    levelAtUnlock: level,
  });

  const payload: CityUnlockPayload = {
    building,
    unlockedAt,
    levelAtUnlock: level,
  };

  if (options.celebrate) {
    enqueueCelebration(payload);
  }

  return true;
};

const checkBuildingsForLevel = async (level: number, celebrate: boolean): Promise<void> => {
  const eligible = sortBuildingsByLevel(getEligibleBuildings(level));
  const pending = eligible.filter((building) => !unlockedKeys.has(building.key));

  for (const building of pending) {
    const unlocked = await unlockBuilding(building, level, { celebrate });
    if (!unlocked) break;
  }

  await refreshStore(level);
};

export const CityService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      void CityService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    if (event.type !== 'PLAYER_LEVEL_UP') return;

    await checkBuildingsForLevel(event.level, true);
  },

  async initialize(): Promise<void> {
    const unlocks = await CityBuildingUnlockRepository.findAll();
    unlockedKeys = new Set(unlocks.map((unlock) => unlock.buildingKey));
    unlockDates = new Map(unlocks.map((unlock) => [unlock.buildingKey, unlock.unlockedAt]));
    cachedAnalytics = await CityAnalyticsRepository.getOrCreate();

    const player = await getOrCreatePlayer();
    await checkBuildingsForLevel(player.level, false);
  },

  async refresh(): Promise<void> {
    const player = await getOrCreatePlayer();
    await refreshStore(player.level);
  },

  getCachedAnalytics(): CityAnalyticsRecord | null {
    return cachedAnalytics;
  },

  dequeueCelebration: dequeueCityCelebration,
};
