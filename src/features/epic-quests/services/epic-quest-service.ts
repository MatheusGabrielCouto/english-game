import { PlayerService } from '@/features/player/services/player-service';
import { EPIC_MISSION_CATALOG } from '@/features/game-design/catalogs/epic-mission-catalog';
import { getDifficultyConfig } from '@/features/game-design/constants/difficulty';
import { pickDeterministicSubset, scaleCoins, scaleReward } from '@/features/game-design/utils/reward-scaling';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { EpicMissionRepository } from '@/storage/repositories/epic-mission-repository';
import { getLearningDifficulty } from '@/storage/repositories/game-settings-repository';
import type { EpicMissionProgress, EpicMissionViewModel } from '@/types/epic-mission';

import { useEpicQuestsStore } from '../store/epic-quests-store';

const toViewModel = (mission: EpicMissionProgress): EpicMissionViewModel => {
  const percentage =
    mission.targetValue > 0
      ? Math.min(100, Math.round((mission.currentValue / mission.targetValue) * 100))
      : 0;

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

  for (const template of selected) {
    await EpicMissionRepository.upsert({
      id: template.id,
      title: template.title,
      description: template.description,
      missionType: template.missionType,
      targetValue: template.targetValue,
      currentValue: 0,
      xpReward: scaleReward(template.baseXp, template.difficulty, difficulty),
      coinReward: scaleCoins(template.baseCoins, template.difficulty, difficulty),
      difficulty: template.difficulty,
      status: 'active',
      startedAt,
      completedAt: null,
    });
  }
};

const completeMission = async (mission: EpicMissionProgress): Promise<void> => {
  const completedAt = new Date().toISOString();
  await EpicMissionRepository.complete(mission.id, completedAt);
  PlayerService.addXP(mission.xpReward);
  PlayerService.addCoins(mission.coinReward);
  await refreshStore();
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

  await refreshStore();
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
    await refreshStore();
  },

  async refresh(): Promise<void> {
    await refreshStore();
  },
};
