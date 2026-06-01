import { CITY_POIS_BY_KEY } from '@/data/loaders/city';
import {
    POI_MISSION_TEMPLATES_BY_POI,
    type PoiMissionTemplate,
} from '@/data/loaders/poi-missions';
import { getDifficultyConfig } from '@/features/game-design/constants/difficulty';
import { MissionDifficultyTier } from '@/features/game-design/constants/mission-types';
import { pickDeterministicSubset, scaleCoins, scaleReward } from '@/features/game-design/utils/reward-scaling';
import { PlayerService } from '@/features/player/services/player-service';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityPoiMissionRepository } from '@/storage/repositories/city-poi-mission-repository';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { getLearningDifficulty } from '@/storage/repositories/game-settings-repository';
import type { CityPoiMission, LocalMissionTypeValue } from '@/types/city-poi-mission';
import { LocalMissionType, getPoiMissionStatus } from '@/types/city-poi-mission';

import { applyLocalXpToPoi } from '../utils/apply-local-xp';
import { CityEventService } from './city-event-service';
import { CityMapService } from './city-map-service';
import { CityPoiChainService } from './city-poi-chain-service';
import { MemoryWallService } from './memory-wall-service';

let listenersInitialized = false;

const ensureDailyMissionsLocks = new Map<string, Promise<void>>();

const getMissionsPerPoi = (localLevel: number): number => {
  if (localLevel >= 4) return 2;
  if (localLevel >= 2) return 1;
  return 1;
};

const buildMissionFromTemplate = async (
  template: PoiMissionTemplate,
  poiKey: string,
  missionDate: string,
): Promise<CityPoiMission> => {
  const difficulty = await getLearningDifficulty();
  const tier = template.difficulty ?? MissionDifficultyTier.MEDIUM;

  return {
    id: `${poiKey}-${missionDate}-${template.templateKey}`,
    poiKey,
    missionDate,
    templateKey: template.templateKey,
    title: template.title,
    description: template.description,
    missionType: template.missionType,
    targetValue: template.targetValue,
    currentValue: 0,
    xpReward: scaleReward(template.baseXp, tier, difficulty),
    coinReward: scaleCoins(template.baseCoins, tier, difficulty),
    localXpReward: Math.max(10, Math.round(template.baseLocalXp * getDifficultyConfig(difficulty).xpMultiplier)),
    completed: false,
    claimed: false,
    createdAt: new Date().toISOString(),
    eventKey: null,
    chainKey: null,
    chainStep: null,
  };
};

const generateMissionsForPoi = async (
  poiKey: string,
  missionDate: string,
  localLevel: number,
): Promise<CityPoiMission[]> => {
  const pool = (POI_MISSION_TEMPLATES_BY_POI[poiKey] ?? []).filter(
    (t) => t.minLocalLevel <= localLevel,
  );

  const gated: PoiMissionTemplate[] = [];
  for (const template of pool) {
    if (!template.requiresLemmaSet) {
      gated.push(template);
      continue;
    }
    const unlocked = await MemoryWallService.isLemmaSetUnlocked(template.requiresLemmaSet);
    if (unlocked) gated.push(template);
  }

  if (gated.length === 0) return [];

  const count = Math.min(getMissionsPerPoi(localLevel), gated.length);
  const selected = pickDeterministicSubset(
    gated,
    count,
    `poi-mission-${poiKey}-${missionDate}`,
  );

  const missions: CityPoiMission[] = [];
  for (const template of selected) {
    missions.push(await buildMissionFromTemplate(template, poiKey, missionDate));
  }

  return missions;
};

const bumpMissions = async (
  missionDate: string,
  missionType: LocalMissionTypeValue,
  delta: number,
  filter?: (mission: CityPoiMission) => boolean,
): Promise<void> => {
  const missions = await CityPoiMissionRepository.findByDate(missionDate);
  let changed = false;

  for (const mission of missions) {
    if (mission.claimed || mission.missionType !== missionType) continue;
    if (filter && !filter(mission)) continue;

    const newValue = Math.min(mission.targetValue, mission.currentValue + delta);
    if (newValue === mission.currentValue) continue;

    const completed = newValue >= mission.targetValue;
    await CityPoiMissionRepository.updateProgress(mission.id, newValue, completed);
    changed = true;
  }

  if (changed) {
    await CityMapService.refresh();
  }
};

export const CityPoiMissionService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event: GameEvent) => {
      void CityPoiMissionService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    const today = getTodayKey();
    await CityPoiMissionService.ensureDailyMissions(today);

    switch (event.type) {
      case 'DAILY_MISSION_COMPLETED':
        await bumpMissions(today, LocalMissionType.COMPLETE_DAILY_GLOBAL, 1);
        break;
      case 'STUDY_DAY_RECORDED':
        await bumpMissions(today, LocalMissionType.STUDY_DAY, 1);
        break;
      case 'FOCUS_SESSION_COMPLETED':
        await bumpMissions(today, LocalMissionType.FOCUS_SESSION, 1);
        break;
      case 'SPEAKING_SESSION_COMPLETED':
        await bumpMissions(today, LocalMissionType.SPEAKING_UNITS, event.amount ?? 1);
        break;
      case 'WORDS_LEARNED':
        await bumpMissions(today, LocalMissionType.SPEAKING_UNITS, event.amount ?? 1);
        break;
      case 'POI_VISITED':
        if (event.poiKey === 'city_park') {
          await bumpMissions(today, LocalMissionType.PET_VISIT, 1, (m) => m.poiKey === 'city_park');
        }
        break;
      default:
        break;
    }
  },

  async ensureDailyMissions(missionDate: string = getTodayKey()): Promise<void> {
    const inFlight = ensureDailyMissionsLocks.get(missionDate);
    if (inFlight) return inFlight;

    const run = (async () => {
      const pois = await CityPoiRepository.findAll();
      const unlocked = pois.filter((p) => p.unlockedAt);

      for (const poi of unlocked) {
        const missions = await generateMissionsForPoi(poi.poiKey, missionDate, poi.localLevel);
        for (const mission of missions) {
          await CityPoiMissionRepository.insert(mission);
        }
      }
    })();

    ensureDailyMissionsLocks.set(missionDate, run);
    try {
      await run;
    } finally {
      if (ensureDailyMissionsLocks.get(missionDate) === run) {
        ensureDailyMissionsLocks.delete(missionDate);
      }
    }
  },

  async initialize(): Promise<void> {
    await CityPoiMissionService.ensureDailyMissions();
    await CityPoiChainService.ensureAllChainMissions();
    await CityMapService.refresh();
  },

  async getMissionsForPoi(poiKey: string, missionDate: string = getTodayKey()): Promise<CityPoiMission[]> {
    await CityPoiMissionService.ensureDailyMissions(missionDate);
    await CityPoiChainService.ensureChainMissionsForPoi(poiKey, missionDate);
    return CityPoiMissionRepository.findByPoiAndDate(poiKey, missionDate);
  },

  async getEventMissionsForPoi(
    poiKey: string,
    eventKey: string,
    missionDate: string = getTodayKey(),
  ): Promise<CityPoiMission[]> {
    await CityEventService.ensureEventMissions(eventKey, missionDate);
    return CityPoiMissionRepository.findByPoiDateAndEvent(poiKey, missionDate, eventKey);
  },

  async getClaimablePoiKeys(missionDate: string = getTodayKey()): Promise<string[]> {
    const missions = await CityPoiMissionRepository.findByDate(missionDate);
    const keys = new Set<string>();

    for (const mission of missions) {
      if (getPoiMissionStatus(mission) === 'completed') {
        keys.add(mission.poiKey);
      }
    }

    return [...keys];
  },

  async claimMission(missionId: string): Promise<{ ok: boolean; reason?: string }> {
    const mission = await CityPoiMissionRepository.findById(missionId);
    if (!mission) return { ok: false, reason: 'not_found' };

    const status = getPoiMissionStatus(mission);
    if (status === 'claimed') return { ok: false, reason: 'already_claimed' };
    if (status !== 'completed') return { ok: false, reason: 'not_completed' };

    const poi = await CityPoiRepository.findByKey(mission.poiKey);
    if (!poi?.unlockedAt) return { ok: false, reason: 'poi_locked' };

    PlayerService.addXP(mission.xpReward);
    PlayerService.addCoins(mission.coinReward);
    await CityPoiMissionRepository.markClaimed(missionId);

    await applyLocalXpToPoi(mission.poiKey, mission.localXpReward);

    const definition = CITY_POIS_BY_KEY[mission.poiKey];
    if (mission.chainKey) {
      await CityPoiChainService.onChainMissionClaimed(mission);
    } else if (mission.eventKey) {
      GameEvents.emit({
        type: 'CITY_EVENT_MISSION_COMPLETED',
        eventKey: mission.eventKey,
        poiKey: mission.poiKey,
        missionTitle: mission.title,
      });
      await CityEventService.onEventMissionClaimed(mission.eventKey);
    } else {
      GameEvents.emit({
        type: 'LOCAL_MISSION_COMPLETED',
        poiKey: mission.poiKey,
        poiName: definition?.name ?? mission.poiKey,
        missionTitle: mission.title,
        xpReward: mission.xpReward,
        coinReward: mission.coinReward,
        localXpReward: mission.localXpReward,
      });
    }

    await CityMapService.refresh();

    return { ok: true };
  },
};
