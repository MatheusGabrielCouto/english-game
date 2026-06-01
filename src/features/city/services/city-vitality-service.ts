import { pickDeterministicSubset } from '@/features/game-design/utils/reward-scaling';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityMapStateRepository } from '@/storage/repositories/city-map-state-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import type { CityRumorViewModel, CityVitalityBand } from '@/types/city-map';

import { CITY_RUMORS, getVitalityBand } from '../constants/city-rumors';
import { CITY_VITALITY } from '../constants/city-vitality-config';
import { useCityMapStore } from '../store/city-map-store';
import { CityMapService } from './city-map-service';

let listenersInitialized = false;

const clampVitality = (value: number): number =>
  Math.min(CITY_VITALITY.max, Math.max(CITY_VITALITY.min, value));

const pickRumorForBand = (band: CityVitalityBand, today: string): CityRumorViewModel | null => {
  const pool = CITY_RUMORS.filter((rumor) => rumor.band === band);
  if (pool.length === 0) return null;

  const [picked] = pickDeterministicSubset(pool, 1, `city-rumor-${band}-${today}`);
  if (!picked) return null;

  return {
    key: picked.key,
    message: picked.message,
    npcHint: picked.npcHint ?? null,
  };
};

const refreshRumor = async (vitality: number): Promise<CityRumorViewModel | null> => {
  const today = getTodayKey();
  const band = getVitalityBand(vitality);
  const rumor = pickRumorForBand(band, today);
  const state = await CityMapStateRepository.getOrCreate();

  if (state.activeRumorKey === rumor?.key && state.rumorUpdatedAt?.startsWith(today)) {
    return rumor;
  }

  await CityMapStateRepository.setActiveRumor(rumor?.key ?? null);
  useCityMapStore.setState({ activeRumor: rumor });

  return rumor;
};

const syncLivingState = async (): Promise<void> => {
  const state = await CityMapStateRepository.getOrCreate();
  const band = getVitalityBand(state.cityVitality);
  const rumor =
    state.activeRumorKey != null
      ? CITY_RUMORS.find((r) => r.key === state.activeRumorKey)
      : null;

  useCityMapStore.setState({
    activeRumor: rumor
      ? { key: rumor.key, message: rumor.message, npcHint: rumor.npcHint ?? null }
      : null,
    vitalityBand: band,
  });
};

export const CityVitalityService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void CityVitalityService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    switch (event.type) {
      case 'STUDY_DAY_RECORDED':
        await CityVitalityService.adjust(CITY_VITALITY.studyDayGain);
        break;
      case 'LOCAL_MISSION_COMPLETED':
      case 'POI_CHAIN_STEP_CLAIMED':
        await CityVitalityService.adjust(CITY_VITALITY.localMissionGain);
        break;
      case 'CONTRACT_COMPLETED':
        await CityVitalityService.adjust(CITY_VITALITY.contractCompleteGain);
        break;
      default:
        break;
    }
  },

  async adjust(delta: number): Promise<number> {
    if (delta === 0) return (await CityMapStateRepository.getOrCreate()).cityVitality;

    const updated = await CityMapStateRepository.adjustVitality(delta);
    await refreshRumor(updated.cityVitality);
    await syncLivingState();
    await CityMapService.refresh();

    return updated.cityVitality;
  },

  async reconcileFromPlayerAbsence(): Promise<void> {
    const player = await getOrCreatePlayer();
    const today = getTodayKey();
    const state = await CityMapStateRepository.getOrCreate();

    if (!player.lastStudyDate) return;
    if (player.lastStudyDate === today) return;

    const last = new Date(`${player.lastStudyDate}T12:00:00`);
    const now = new Date(`${today}T12:00:00`);
    const diffMs = now.getTime() - last.getTime();
    const daysMissed = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (daysMissed < 2) return;

    const penalty = Math.min(
      CITY_VITALITY.maxMissedDayPenalty,
      (daysMissed - 1) * CITY_VITALITY.missedStudyDayPenalty,
    );

    const next = clampVitality(state.cityVitality - penalty);
    if (next === state.cityVitality) return;

    await CityMapStateRepository.setVitality(next);
    await refreshRumor(next);
    await syncLivingState();
    await CityMapService.refresh();
  },

  getVitalityBand(vitality: number): CityVitalityBand {
    return getVitalityBand(vitality);
  },

  getRewardBonuses(vitality: number): { xpPercent: number; coinPercent: number } {
    const band = getVitalityBand(vitality);
    if (band === 'high') {
      return {
        xpPercent: CITY_VITALITY.highXpBonusPercent,
        coinPercent: CITY_VITALITY.highCoinBonusPercent,
      };
    }
    if (band === 'low') {
      return {
        xpPercent: 0,
        coinPercent: -CITY_VITALITY.lowCoinPenaltyPercent,
      };
    }
    return { xpPercent: 0, coinPercent: 0 };
  },

  async initialize(): Promise<void> {
    await CityVitalityService.reconcileFromPlayerAbsence();
    const state = await CityMapStateRepository.getOrCreate();
    await refreshRumor(state.cityVitality);
    await syncLivingState();
  },

  async refresh(): Promise<void> {
    await syncLivingState();
  },
};
