import { CITY_DISTRICT_CATALOG, CITY_POI_CATALOG } from '@/data/loaders/city'
import { CityDistrictRepository } from '@/storage/repositories/city-district-repository'
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository'
import { getMetagameState } from '@/storage/repositories/metagame-repository'
import type { CityPoiRecord } from '@/types/city-map'

import {
    CENTRO_POI_KEYS,
    INTERNATIONAL_UNLOCK,
    SEASON_MUSEUM_POI_KEY
} from '../constants/city-vitality-config'

export const canUnlockInternationalDistrict = (
  playerLevel: number,
  pois: CityPoiRecord[],
): boolean => {
  if (playerLevel < INTERNATIONAL_UNLOCK.minPlayerLevel) return false

  const centroUnlocked = pois.filter(
    (poi) =>
      (CENTRO_POI_KEYS as readonly string[]).includes(poi.poiKey) &&
      poi.unlockedAt &&
      poi.localLevel >= 2,
  )

  return centroUnlocked.length / CENTRO_POI_KEYS.length >= INTERNATIONAL_UNLOCK.centroLocalLevel2Ratio
}

export const hasSeasonMuseumUnlock = async (): Promise<boolean> => {
  const state = await getMetagameState()
  return (state?.seasonClaimedTiers.length ?? 0) > 0
}

export const isPoiGatedBySpecialRule = async (
  poiKey: string,
): Promise<{ blocked: boolean; reason?: string }> => {
  if (poiKey === SEASON_MUSEUM_POI_KEY) {
    const unlocked = await hasSeasonMuseumUnlock()
    if (!unlocked) {
      return {
        blocked: true,
        reason: 'Resgate o primeiro tier do season pass para abrir o museu.',
      }
    }
  }

  return { blocked: false }
}

export const syncMissingCatalogEntries = async (): Promise<void> => {
  const [existingDistricts, existingPois] = await Promise.all([
    CityDistrictRepository.findAll(),
    CityPoiRepository.findAll(),
  ])

  const districtKeys = new Set(existingDistricts.map((district) => district.districtKey))
  const poiKeys = new Set(existingPois.map((poi) => poi.poiKey))

  const missingDistricts = CITY_DISTRICT_CATALOG.filter(
    (district) => !districtKeys.has(district.districtKey),
  ).map((district) => ({
    districtKey: district.districtKey,
    unlockedAt: null,
    unlockReason: null,
  }))

  const missingPois = CITY_POI_CATALOG.filter((poi) => !poiKeys.has(poi.poiKey)).map((poi) => ({
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
  }))

  await Promise.all([
    CityDistrictRepository.insertMissing(missingDistricts),
    CityPoiRepository.insertMissing(missingPois),
  ])
}
