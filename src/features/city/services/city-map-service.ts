import { CITY_DISTRICT_CATALOG, CITY_POI_CATALOG } from '@/data/loaders/city';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityDistrictRepository } from '@/storage/repositories/city-district-repository';
import { CityMapStateRepository } from '@/storage/repositories/city-map-state-repository';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import type {
  CityDistrictViewModel,
  CityMapSummary,
  CityPoiViewModel,
} from '@/types/city-map';

import { getTodayKey } from '@/features/quests/utils/date';
import { CityPoiMissionRepository } from '@/storage/repositories/city-poi-mission-repository';
import { getPoiMissionStatus } from '@/types/city-poi-mission';

import { getVitalityBand } from '../constants/city-rumors';
import { useCityMapStore } from '../store/city-map-store';
import { getLocalXpProgress } from '../utils/local-level';
import { isPoiGatedBySpecialRule, syncMissingCatalogEntries } from '../utils/city-unlock-rules';
import { CityEventScheduler } from './city-event-scheduler';
import { CityEventService } from './city-event-service';
import { CityLivingService } from './city-living-service';

const getVisiblePoiCatalog = () => {
  const activeEvent = CityEventScheduler.getActiveMajorEvent();
  return CITY_POI_CATALOG.filter((poi) => {
    if (!poi.eventOnly) return true;
    return activeEvent?.temporaryPoiKeys.includes(poi.poiKey) ?? false;
  });
};

let listenersInitialized = false;

const buildViewModelsSync = async (
  playerLevel: number,
): Promise<{
  districts: CityDistrictViewModel[];
  pois: CityPoiViewModel[];
  summary: CityMapSummary;
}> => {
  const [districtRecords, poiRecords, mapState] = await Promise.all([
    CityDistrictRepository.findAll(),
    CityPoiRepository.findAll(),
    CityMapStateRepository.getOrCreate(),
  ]);

  const districtByKey = new Map(districtRecords.map((d) => [d.districtKey, d]));
  const poiByKey = new Map(poiRecords.map((p) => [p.poiKey, p]));

  const districts: CityDistrictViewModel[] = CITY_DISTRICT_CATALOG.map((definition) => {
    const record = districtByKey.get(definition.districtKey);
    const meetsLevel = playerLevel >= definition.requiredPlayerLevel;
    const isUnlocked = Boolean(record?.unlockedAt) && meetsLevel;

    return {
      ...definition,
      unlockedAt: record?.unlockedAt ?? null,
      isUnlocked,
      isLockedByLevel: !meetsLevel,
    };
  });

  const districtUnlockedKeys = new Set(
    districts.filter((d) => d.isUnlocked).map((d) => d.districtKey),
  );

  const pois: CityPoiViewModel[] = await Promise.all(
    getVisiblePoiCatalog().map(async (definition) => {
      const record = poiByKey.get(definition.poiKey);
      const districtUnlocked = districtUnlockedKeys.has(definition.districtKey);
      const meetsLevel = playerLevel >= definition.requiredPlayerLevel;
      const gate = await isPoiGatedBySpecialRule(definition.poiKey);
      const baseUnlocked =
        Boolean(record?.unlockedAt) && districtUnlocked && meetsLevel && !gate.blocked;
      const localLevel = record?.localLevel ?? 1;
      const localXp = record?.localXp ?? 0;
      const { xpToNextLevel, progressPercent } = getLocalXpProgress(
        localLevel,
        localXp,
        definition.maxLocalLevel,
      );

      return {
        ...definition,
        localLevel,
        localXp,
        visualStage: record?.visualStage ?? 1,
        npcTrust: record?.npcTrust ?? 50,
        unlockedAt: record?.unlockedAt ?? null,
        isUnlocked: baseUnlocked,
        isLockedByLevel: !meetsLevel,
        isLockedByDistrict: !districtUnlocked,
        specialLockReason: gate.blocked ? (gate.reason ?? null) : null,
        localXpToNextLevel: xpToNextLevel,
        localXpProgressPercent: progressPercent,
      };
    }),
  );

  const vitalityBand = getVitalityBand(mapState.cityVitality);

  const summary: CityMapSummary = {
    cityName: mapState.cityName,
    cityVitality: mapState.cityVitality,
    vitalityBand,
    unlockedPoiCount: pois.filter((p) => p.isUnlocked).length,
    totalPoiCount: pois.length,
  };

  return { districts, pois, summary };
};

const refreshClaimableMissions = async (): Promise<void> => {
  const missions = await CityPoiMissionRepository.findByDate(getTodayKey());
  const claimablePoiKeys = [
    ...new Set(
      missions
        .filter((mission) => getPoiMissionStatus(mission) === 'completed')
        .map((mission) => mission.poiKey),
    ),
  ];
  useCityMapStore.setState({ claimablePoiKeys });
};

const refreshStore = async (playerLevel: number): Promise<void> => {
  try {
    const { districts, pois, summary } = await buildViewModelsSync(playerLevel);

    useCityMapStore.setState({
      districts,
      pois,
      summary,
      vitalityBand: summary.vitalityBand,
      isLoading: false,
    });

    await CityEventService.syncActiveEvent();
    await refreshClaimableMissions();
    await CityLivingService.refreshParkVisitState();
  } catch {
    useCityMapStore.setState({ isLoading: false });
  }
};

const seedCatalogIfNeeded = async (): Promise<void> => {
  await syncMissingCatalogEntries();
};

const applyUnlocksForLevel = async (playerLevel: number): Promise<void> => {
  const now = new Date().toISOString();

  for (const district of CITY_DISTRICT_CATALOG) {
    if (playerLevel < district.requiredPlayerLevel) continue;

    const existing = await CityDistrictRepository.findByKey(district.districtKey);
    if (existing?.unlockedAt) continue;

    await CityDistrictRepository.upsert({
      districtKey: district.districtKey,
      unlockedAt: now,
      unlockReason: `level_${playerLevel}`,
    });

    GameEvents.emit({
      type: 'DISTRICT_UNLOCKED',
      districtKey: district.districtKey,
      districtName: district.name,
      playerLevel,
    });
  }

  const districtRecords = await CityDistrictRepository.findAll();
  const unlockedDistricts = new Set(
    districtRecords.filter((d) => d.unlockedAt).map((d) => d.districtKey),
  );

  for (const poi of getVisiblePoiCatalog()) {
    if (playerLevel < poi.requiredPlayerLevel) continue;
    if (!unlockedDistricts.has(poi.districtKey)) continue;
    if (poi.eventOnly) continue;

    const gate = await isPoiGatedBySpecialRule(poi.poiKey);
    if (gate.blocked) continue;

    const existing = await CityPoiRepository.findByKey(poi.poiKey);
    if (existing?.unlockedAt) continue;

    await CityPoiRepository.upsert({
      poiKey: poi.poiKey,
      districtKey: poi.districtKey,
      category: poi.category,
      localLevel: existing?.localLevel ?? 1,
      localXp: existing?.localXp ?? 0,
      positionX: poi.positionX,
      positionY: poi.positionY,
      unlockedAt: now,
      visualStage: existing?.visualStage ?? 1,
      npcTrust: existing?.npcTrust ?? 50,
    });
  }

  await CityLivingService.applyExtendedUnlocks(playerLevel);
};

export const CityMapService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      void CityMapService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    if (event.type !== 'PLAYER_LEVEL_UP') return;

    await CityMapService.syncForPlayerLevel(event.level);
  },

  async initialize(): Promise<void> {
    useCityMapStore.setState({ isLoading: true });

    try {
      await seedCatalogIfNeeded();

      const player = await getOrCreatePlayer();
      await applyUnlocksForLevel(player.level);
      await refreshStore(player.level);
    } catch {
      useCityMapStore.setState({ isLoading: false });
    }
  },

  async syncForPlayerLevel(playerLevel: number): Promise<void> {
    await applyUnlocksForLevel(playerLevel);
    await refreshStore(playerLevel);
  },

  async refresh(): Promise<void> {
    try {
      await seedCatalogIfNeeded();
      const player = await getOrCreatePlayer();
      await applyUnlocksForLevel(player.level);
      await refreshStore(player.level);
    } catch {
      useCityMapStore.setState({ isLoading: false });
    }
  },

  async visitPoi(poiKey: string): Promise<void> {
    const poi = useCityMapStore.getState().pois.find((p) => p.poiKey === poiKey);
    if (!poi?.isUnlocked) return;

    GameEvents.emit({
      type: 'POI_VISITED',
      poiKey,
      poiName: poi.name,
    });
  },

  getPoiByKey(poiKey: string): CityPoiViewModel | undefined {
    return useCityMapStore.getState().pois.find((p) => p.poiKey === poiKey);
  },
};
