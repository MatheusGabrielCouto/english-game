import { CITY_POIS_BY_KEY } from '@/data/loaders/city';
import { PetService } from '@/features/pet/services/pet-service';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityDistrictRepository } from '@/storage/repositories/city-district-repository';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { CityPoiVisitRepository } from '@/storage/repositories/city-poi-visit-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';

import {
  INTERNATIONAL_DISTRICT_KEY,
  SEASON_MUSEUM_POI_KEY,
} from '../constants/city-vitality-config';
import { CITY_VITALITY } from '../constants/city-vitality-config';
import { useCityMapStore } from '../store/city-map-store';
import {
  canUnlockInternationalDistrict,
  hasSeasonMuseumUnlock,
  isPoiGatedBySpecialRule,
  syncMissingCatalogEntries,
} from '../utils/city-unlock-rules';
import { CityMapService } from './city-map-service';

let listenersInitialized = false;

const unlockPoi = async (poiKey: string, reason: string): Promise<void> => {
  const poi = await CityPoiRepository.findByKey(poiKey);
  if (poi?.unlockedAt) return;

  const definition = CITY_POIS_BY_KEY[poiKey];
  if (!definition) return;

  const gate = await isPoiGatedBySpecialRule(poiKey);
  if (gate.blocked) return;

  const now = new Date().toISOString();
  await CityPoiRepository.upsert({
    poiKey: definition.poiKey,
    districtKey: definition.districtKey,
    category: definition.category,
    localLevel: poi?.localLevel ?? 1,
    localXp: poi?.localXp ?? 0,
    positionX: definition.positionX,
    positionY: definition.positionY,
    unlockedAt: now,
    visualStage: poi?.visualStage ?? 1,
    npcTrust: poi?.npcTrust ?? 50,
  });
};

const tryUnlockInternational = async (playerLevel: number): Promise<void> => {
  const pois = await CityPoiRepository.findAll();
  if (!canUnlockInternationalDistrict(playerLevel, pois)) return;

  const district = await CityDistrictRepository.findByKey(INTERNATIONAL_DISTRICT_KEY);
  if (!district?.unlockedAt) {
    const now = new Date().toISOString();
    await CityDistrictRepository.upsert({
      districtKey: INTERNATIONAL_DISTRICT_KEY,
      unlockedAt: now,
      unlockReason: `global_quarter_level_${playerLevel}`,
    });

    GameEvents.emit({
      type: 'DISTRICT_UNLOCKED',
      districtKey: INTERNATIONAL_DISTRICT_KEY,
      districtName: 'Distrito Internacional',
      playerLevel,
    });
  }

  const districtRecords = await CityDistrictRepository.findAll();
  const intlUnlocked = districtRecords.some(
    (d) => d.districtKey === INTERNATIONAL_DISTRICT_KEY && d.unlockedAt,
  );
  if (!intlUnlocked) return;

  for (const poi of Object.values(CITY_POIS_BY_KEY)) {
    if (poi.districtKey !== INTERNATIONAL_DISTRICT_KEY) continue;
    if (playerLevel < poi.requiredPlayerLevel) continue;
    await unlockPoi(poi.poiKey, 'international_district');
  }
};

const tryUnlockSeasonMuseum = async (): Promise<void> => {
  const canUnlock = await hasSeasonMuseumUnlock();
  if (!canUnlock) return;

  const player = await getOrCreatePlayer();
  if (player.level < (CITY_POIS_BY_KEY[SEASON_MUSEUM_POI_KEY]?.requiredPlayerLevel ?? 5)) return;

  const estudos = await CityDistrictRepository.findByKey('estudos');
  const centro = await CityDistrictRepository.findByKey('centro');
  const districtOk = Boolean(centro?.unlockedAt ?? estudos?.unlockedAt);
  if (!districtOk) return;

  await unlockPoi(SEASON_MUSEUM_POI_KEY, 'season_tier_claimed');
};

export const CityLivingService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void CityLivingService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    if (event.type === 'PLAYER_LEVEL_UP') {
      await CityLivingService.applyExtendedUnlocks(event.level);
      return;
    }

    if (event.type === 'SEASON_REWARD_CLAIMED') {
      await tryUnlockSeasonMuseum();
      await CityMapService.refresh();
      return;
    }

    if (event.type === 'POI_LEVEL_UP' || event.type === 'POI_PROJECT_COMPLETED') {
      const player = await getOrCreatePlayer();
      await tryUnlockInternational(player.level);
      await CityMapService.refresh();
    }
  },

  async applyExtendedUnlocks(playerLevel: number): Promise<void> {
    await syncMissingCatalogEntries();
    await tryUnlockSeasonMuseum();
    await tryUnlockInternational(playerLevel);
  },

  async initialize(): Promise<void> {
    await syncMissingCatalogEntries();
    const player = await getOrCreatePlayer();
    await CityLivingService.applyExtendedUnlocks(player.level);
    await CityLivingService.refreshParkVisitState();
  },

  async refreshParkVisitState(): Promise<void> {
    const today = getTodayKey();
    const visit = await CityPoiVisitRepository.findByPoiAndDate('city_park', today);
    useCityMapStore.setState({ petVisitedParkToday: visit?.petVisitBonus ?? false });
  },

  async bringPetToPark(): Promise<{ ok: boolean; reason?: string }> {
    const today = getTodayKey();
    const visit = await CityPoiVisitRepository.findByPoiAndDate('city_park', today);

    if (visit?.petVisitBonus) {
      return { ok: false, reason: 'already_brought' };
    }

    const poi = await CityPoiRepository.findByKey('city_park');
    if (!poi?.unlockedAt) {
      return { ok: false, reason: 'poi_locked' };
    }

    const now = new Date().toISOString();
    await CityPoiVisitRepository.upsert({
      poiKey: 'city_park',
      visitDate: today,
      petVisitBonus: true,
      visitedAt: now,
    });

    await PetService.applyStudyBonus({
      happiness: CITY_VITALITY.parkPetHappinessBonus,
    });

    GameEvents.emit({
      type: 'POI_VISITED',
      poiKey: 'city_park',
      poiName: CITY_POIS_BY_KEY.city_park?.name ?? 'Parque',
    });

    useCityMapStore.setState({ petVisitedParkToday: true });
    await CityMapService.refresh();

    return { ok: true };
  },

  async getPoiGateMessage(poiKey: string): Promise<string | null> {
    const gate = await isPoiGatedBySpecialRule(poiKey);
    return gate.blocked ? (gate.reason ?? null) : null;
  },
};
