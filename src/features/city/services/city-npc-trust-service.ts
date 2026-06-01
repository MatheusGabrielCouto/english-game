import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';

import {
  clampNpcTrust,
  getNpcTrustBand,
  NPC_TRUST_DELTA,
  normalizeNpcTrust,
} from '../constants/npc-trust-config';
import { CityMapService } from './city-map-service';

let listenersInitialized = false;

const applyTrustDelta = async (poiKey: string, delta: number): Promise<number | null> => {
  if (delta === 0) return null;

  const poi = await CityPoiRepository.findByKey(poiKey);
  if (!poi?.unlockedAt) return null;

  const next = clampNpcTrust(normalizeNpcTrust(poi.npcTrust) + delta);
  if (next === poi.npcTrust) return next;

  await CityPoiRepository.upsert({ ...poi, npcTrust: next });

  const band = getNpcTrustBand(next);
  GameEvents.emit({
    type: 'POI_NPC_TRUST_CHANGED',
    poiKey,
    trust: next,
    band,
    delta,
  });

  return next;
};

export const CityNpcTrustService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      void CityNpcTrustService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    switch (event.type) {
      case 'LOCAL_MISSION_COMPLETED':
        await applyTrustDelta(event.poiKey, NPC_TRUST_DELTA.localMissionClaimed);
        break;
      case 'CONTRACT_COMPLETED':
        await applyTrustDelta(event.issuerPoiKey, NPC_TRUST_DELTA.contractCompleted);
        break;
      case 'CONTRACT_FAILED':
        await applyTrustDelta(event.issuerPoiKey, NPC_TRUST_DELTA.contractFailed);
        break;
      case 'POI_CHAIN_STEP_CLAIMED':
        await applyTrustDelta(event.poiKey, NPC_TRUST_DELTA.chainStepClaimed);
        break;
      case 'POI_CHAIN_COMPLETED':
        await applyTrustDelta(event.poiKey, NPC_TRUST_DELTA.chainComplete);
        break;
      default:
        return;
    }

    await CityMapService.refresh();
  },

  async adjustTrust(poiKey: string, delta: number): Promise<number | null> {
    const result = await applyTrustDelta(poiKey, delta);
    if (result !== null) await CityMapService.refresh();
    return result;
  },
};
