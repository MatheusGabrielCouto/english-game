import { CITY_POIS_BY_KEY } from '@/data/loaders/city';
import { GameEvents } from '@/services/game-events';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import type { CityPoiRecord } from '@/types/city-map';

import { getLocalXpCapForLevel } from './local-level';

export type ApplyLocalXpResult = {
  poi: CityPoiRecord;
  levelsGained: number;
  newLevel: number;
};

export const applyLocalXpToPoi = async (
  poiKey: string,
  xpAmount: number,
): Promise<ApplyLocalXpResult | null> => {
  if (xpAmount <= 0) return null;

  const existing = await CityPoiRepository.findByKey(poiKey);
  if (!existing?.unlockedAt) return null;

  const definition = CITY_POIS_BY_KEY[poiKey];
  const maxLocalLevel = definition?.maxLocalLevel ?? 5;

  let localLevel = existing.localLevel;
  let localXp = existing.localXp + xpAmount;
  let levelsGained = 0;
  const startLevel = localLevel;

  while (localLevel < maxLocalLevel) {
    const cap = getLocalXpCapForLevel(localLevel);
    if (localXp < cap) break;

    localXp -= cap;
    localLevel += 1;
    levelsGained += 1;
  }

  if (localLevel >= maxLocalLevel) {
    localXp = 0;
  }

  const updated: CityPoiRecord = {
    ...existing,
    localLevel,
    localXp,
    visualStage: Math.max(existing.visualStage, localLevel),
  };

  await CityPoiRepository.upsert(updated);

  if (levelsGained > 0 && definition) {
    for (let level = startLevel + 1; level <= localLevel; level += 1) {
      GameEvents.emit({
        type: 'POI_LEVEL_UP',
        poiKey,
        poiName: definition.name,
        newLocalLevel: level,
        maxLocalLevel,
      });
    }
  }

  return {
    poi: updated,
    levelsGained,
    newLevel: localLevel,
  };
};
