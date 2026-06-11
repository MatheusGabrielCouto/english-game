import { EPIC_MISSION_CATALOG } from '@/features/game-design/catalogs/epic-mission-catalog';
import { getDifficultyConfig } from '@/features/game-design/constants/difficulty';
import { pickDeterministicSubset, scaleCoins, scaleReward } from '@/features/game-design/utils/reward-scaling';
import { PlayerService } from '@/features/player/services/player-service';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { EpicMissionRepository } from '@/storage/repositories/epic-mission-repository';
import { getLearningDifficulty } from '@/storage/repositories/game-settings-repository';
import { getOrCreatePlayer } from '@/storage/repositories/player-repository';
import type { EpicMissionProgress, EpicMissionViewModel } from '@/types/epic-mission';

import { useEpicQuestsStore } from '../store/epic-quests-store';
import {
    computeEpicMissionPercentage,
    resolvePlayerLevelMissionProgress,
} from '../utils/epic-quest-progress';

const catalogById = new Map(EPIC_MISSION_CATALOG.map((template) => [template.id, template]));

const toViewModel = (mission: EpicMissionProgress): EpicMissionViewModel => {
  const percentage = computeEpicMissionPercentage(mission.currentValue, mission.targetValue);

  return {
    ...mission,
    percentage,
    isComplete: mission.currentValue >= mission.targetValue,
  };
};

const refreshStore = async (): Promise<void> => {
  const missions = await EpicMissionRepository.findAll();
  useEpicQuestsStore.setState({
    missions: missions.map(toViewModel),
    isLoading: false,
  });
};

const ensureEpicMissions = async (): Promise<void> => {
  const existing = await EpicMissionRepository.findAll();
  if (existing.length > 0) return;

  const difficulty = await getLearningDifficulty();
  const config = getDifficultyConfig(difficulty);
  const selected = pickDeterministicSubset(
    EPIC_MISSION_CATALOG,
    Math.min(5, EPIC_MISSION_CATALOG.length),
    `epic-init-${difficulty}`,
  );

  const startedAt = new Date().toISOString();
  const player = await getOrCreatePlayer();

  for (const template of selected) {
    const currentValue =
      template.missionType === 'PLAYER_LEVEL'
        ? resolvePlayerLevelMissionProgress(player.level, template.targetValue)
        : 0;

    await EpicMissionRepository.upsert({
      id: template.id,
      title: template.title,
      description: template.description,
      missionType: template.missionType,
      targetValue: template.targetValue,
      currentValue,
      xpReward: scaleReward(template.baseXp, template.difficulty, difficulty),
      coinReward: scaleCoins(template.baseCoins, template.difficulty, difficulty),
      difficulty: template.difficulty,
      status: 'active',
      startedAt,
      completedAt: null,
    });
  }
};

const reconcileMissionDefinitions = async (): Promise<void> => {
  const missions = await EpicMissionRepository.findAll();
  const player = await getOrCreatePlayer();

  for (const mission of missions) {
    const template = catalogById.get(mission.id);
    if (!template) continue;

    const definitionChanged =
      mission.missionType !== template.missionType ||
      mission.targetValue !== template.targetValue ||
      mission.title !== template.title ||
      mission.description !== template.description;

    if (!definitionChanged) continue;

    const currentValue =
      template.missionType === 'PLAYER_LEVEL'
        ? resolvePlayerLevelMissionProgress(player.level, template.targetValue)
        : mission.missionType === template.missionType
          ? mission.currentValue
          : 0;

    const patchedMission: EpicMissionProgress = {
      ...mission,
      title: template.title,
      description: template.description,
      missionType: template.missionType,
      targetValue: template.targetValue,
      currentValue,
    };

    await EpicMissionRepository.patchMission(mission.id, {
      title: patchedMission.title,
      description: patchedMission.description,
      missionType: patchedMission.missionType,
      targetValue: patchedMission.targetValue,
      currentValue: patchedMission.currentValue,
    });

    if (patchedMission.status === 'active' && currentValue >= template.targetValue) {
      await completeMission(patchedMission);
    }
  }
};

const syncPlayerLevelMissions = async (playerLevel?: number): Promise<void> => {
  const level = playerLevel ?? (await getOrCreatePlayer()).level;
  const missions = await EpicMissionRepository.findActive();
  let changed = false;

  for (const mission of missions) {
    if (mission.missionType !== 'PLAYER_LEVEL') continue;

    const nextValue = resolvePlayerLevelMissionProgress(level, mission.targetValue);
    if (nextValue === mission.currentValue) continue;

    changed = true;
    await EpicMissionRepository.updateProgress(mission.id, nextValue);

    if (nextValue >= mission.targetValue) {
      await completeMission({ ...mission, currentValue: nextValue });
    }
  }

  if (changed) {
    GameEvents.scheduleCoalescedAfterBatch(refreshStore);
  }
};

const completeMission = async (mission: EpicMissionProgress): Promise<void> => {
  const completedAt = new Date().toISOString();
  await EpicMissionRepository.complete(mission.id, completedAt);
  PlayerService.addXP(mission.xpReward);
  PlayerService.addCoins(mission.coinReward);
  GameEvents.scheduleCoalescedAfterBatch(refreshStore);
};

const updateProgressByType = async (missionType: string, delta: number): Promise<void> => {
  const missions = await EpicMissionRepository.findActive();

  for (const mission of missions) {
    if (mission.missionType !== missionType) continue;

    const nextValue = mission.currentValue + delta;
    await EpicMissionRepository.updateProgress(mission.id, nextValue);

    if (nextValue >= mission.targetValue) {
      await completeMission({ ...mission, currentValue: nextValue });
    }
  }

  GameEvents.scheduleCoalescedAfterBatch(refreshStore);
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  switch (event.type) {
    case 'DAILY_MISSION_COMPLETED':
      await updateProgressByType('DAILY_MISSIONS_COMPLETED', 1);
      break;
    case 'XP_GAINED':
      await updateProgressByType('XP_GAINED', event.amount);
      break;
    case 'STUDY_DAY_RECORDED':
      await updateProgressByType('STUDY_DAYS', 1);
      break;
    case 'CONTRACT_COMPLETED':
      await updateProgressByType('CONTRACTS_COMPLETED', 1);
      break;
    case 'ACHIEVEMENT_UNLOCKED':
      await updateProgressByType('ACHIEVEMENTS_UNLOCKED', 1);
      break;
    case 'LOOT_BOX_OPENED':
      await updateProgressByType('LOOT_BOXES_OPENED', 1);
      break;
    case 'PET_STAGE_EVOLVED':
      await updateProgressByType('PET_EVOLUTIONS', 1);
      break;
    case 'CITY_BUILDING_UNLOCKED':
      await updateProgressByType('CITY_BUILDINGS', 1);
      break;
    case 'PLAYER_LEVEL_UP':
      await syncPlayerLevelMissions(event.level);
      break;
    default:
      break;
  }
};

let listenersInitialized = false;

export const EpicQuestService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;
    GameEvents.subscribe((event) => {
      void handleGameEvent(event);
    });
  },

  async initialize(): Promise<void> {
    await ensureEpicMissions();
    await reconcileMissionDefinitions();
    await syncPlayerLevelMissions();
    await refreshStore();
  },

  async refresh(): Promise<void> {
    await reconcileMissionDefinitions();
    await syncPlayerLevelMissions();
    await refreshStore();
  },
};
