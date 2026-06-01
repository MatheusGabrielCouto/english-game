import { CITY_DISTRICT_CATALOG, CITY_POI_CATALOG } from '@/data/loaders/city';
import { getMetagameState } from '@/storage/repositories/metagame-repository';
import { CityDistrictRepository } from '@/storage/repositories/city-district-repository';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import type { CityPoiRecord } from '@/types/city-map';

import {
  CENTRO_POI_KEYS,
  INTERNATIONAL_DISTRICT_KEY,
  INTERNATIONAL_UNLOCK,
  SEASON_MUSEUM_POI_KEY,
} from '../constants/city-vitality-config';

export const canUnlockInternationalDistrict = (
  playerLevel: number,
  pois: CityPoiRecord[],
): boolean => {
  if (playerLevel < INTERNATIONAL_UNLOCK.minPlayerLevel) return false;

  const centroUnlocked = pois.filter(
    (poi) =>
      (CENTRO_POI_KEYS as readonly string[]).includes(poi.poiKey) &&
      poi.unlockedAt &&
      poi.localLevel >= 2,
  );

  return centroUnlocked.length / CENTRO_POI_KEYS.length >= INTERNATIONAL_UNLOCK.centroLocalLevel2Ratio;
};

export const hasSeasonMuseumUnlock = async (): Promise<boolean> => {
  const state = await getMetagameState();
  return (state?.seasonClaimedTiers.length ?? 0) > 0;
};

export const isPoiGatedBySpecialRule = async (
  poiKey: string,
): Promise<{ blocked: boolean; reason?: string }> => {
  if (poiKey === SEASON_MUSEUM_POI_KEY) {
    const unlocked = await hasSeasonMuseumUnlock();
    if (!unlocked) {
      return {
        blocked: true,
        reason: 'Resgate o primeiro tier do season pass para abrir o museu.',
      };
    }
  }

  return { blocked: false };
};

export const syncMissingCatalogEntries = async (): Promise<void> => {
  for (const district of CITY_DISTRICT_CATALOG) {
    const existing = await CityDistrictRepository.findByKey(district.districtKey);
    if (existing) continue;

    await CityDistrictRepository.upsert({
      districtKey: district.districtKey,
      unlockedAt: null,
      unlockReason: null,
    });
  }

  for (const poi of CITY_POI_CATALOG) {
    const existing = await CityPoiRepository.findByKey(poi.poiKey);
    if (existing) continue;

    await CityPoiRepository.upsert({
      poiKey: poi.poiKey,
      districtKey: poi.districtKey,
      category: poi.category,
      localLevel: 1,
      localXp: 0,
      positionX: poi.positionX,
      positionY: poi.positionY,
      unlockedAt: null,
      visualStage: 1,
      npcTrust: 50,
    });
  }
};
