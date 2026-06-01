import { POI_CHAINS_BY_KEY, POI_CHAINS_BY_POI } from '@/data/loaders/poi-chains';
import { getDifficultyConfig } from '@/features/game-design/constants/difficulty';
import { MissionDifficultyTier } from '@/features/game-design/constants/mission-types';
import { scaleCoins, scaleReward } from '@/features/game-design/utils/reward-scaling';
import { getTodayKey } from '@/features/quests/utils/date';
import { GameEvents } from '@/services/game-events';
import { CityPoiChainRepository } from '@/storage/repositories/city-poi-chain-repository';
import { CityPoiMissionRepository } from '@/storage/repositories/city-poi-mission-repository';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { getLearningDifficulty } from '@/storage/repositories/game-settings-repository';
import type {
  PoiChainDefinition,
  PoiChainProgressRecord,
  PoiChainStepDefinition,
  PoiChainViewModel,
} from '@/types/city-poi-chain';
import type { CityPoiMission } from '@/types/city-poi-mission';

const buildChainViewModel = (
  chain: PoiChainDefinition,
  progress: PoiChainProgressRecord | null,
): PoiChainViewModel => {
  const isComplete = progress?.completed ?? false;
  const currentStep = progress?.currentStep ?? 0;
  const activeStepIndex = isComplete ? null : Math.min(currentStep, chain.steps.length - 1);

  return {
    ...chain,
    progress,
    totalSteps: chain.steps.length,
    activeStepIndex,
    isComplete,
  };
};

const buildChainMission = async (
  chain: PoiChainDefinition,
  step: PoiChainStepDefinition,
  missionDate: string,
): Promise<CityPoiMission> => {
  const difficulty = await getLearningDifficulty();
  const tier =
    step.difficulty === 'expert'
      ? MissionDifficultyTier.EXPERT
      : step.difficulty === 'hard'
        ? MissionDifficultyTier.HARD
        : step.difficulty === 'easy'
          ? MissionDifficultyTier.EASY
          : MissionDifficultyTier.MEDIUM;

  return {
    id: `chain-${chain.chainKey}-${step.stepIndex}-${missionDate}`,
    poiKey: chain.poiKey,
    missionDate,
    templateKey: step.templateKey,
    title: step.title,
    description: step.description,
    missionType: step.missionType,
    targetValue: step.targetValue,
    currentValue: 0,
    xpReward: scaleReward(step.baseXp, tier, difficulty),
    coinReward: scaleCoins(step.baseCoins, tier, difficulty),
    localXpReward: Math.max(
      10,
      Math.round(step.baseLocalXp * getDifficultyConfig(difficulty).xpMultiplier),
    ),
    completed: false,
    claimed: false,
    createdAt: new Date().toISOString(),
    eventKey: null,
    chainKey: chain.chainKey,
    chainStep: step.stepIndex,
  };
};

export const CityPoiChainService = {
  async ensureAllChainMissions(missionDate: string = getTodayKey()): Promise<void> {
    const pois = await CityPoiRepository.findAll();
    for (const poi of pois) {
      if (!poi.unlockedAt) continue;
      await CityPoiChainService.ensureChainMissionsForPoi(poi.poiKey, missionDate);
    }
  },

  async getChainsForPoi(poiKey: string): Promise<PoiChainViewModel[]> {
    const definitions = POI_CHAINS_BY_POI[poiKey] ?? [];
    const poi = await CityPoiRepository.findByKey(poiKey);
    if (!poi?.unlockedAt) return [];

    const progressList = await CityPoiChainRepository.findByPoi(poiKey);
    const progressByKey = new Map(progressList.map((p) => [p.chainKey, p]));

    return definitions
      .filter((chain) => chain.minLocalLevel <= poi.localLevel)
      .map((chain) => buildChainViewModel(chain, progressByKey.get(chain.chainKey) ?? null));
  },

  async getActiveChainMission(
    poiKey: string,
    chainKey: string,
    missionDate: string = getTodayKey(),
  ): Promise<CityPoiMission | null> {
    const chain = POI_CHAINS_BY_KEY[chainKey];
    if (!chain || chain.poiKey !== poiKey) return null;

    const progress = await CityPoiChainRepository.findOne(poiKey, chainKey);
    if (progress?.completed) return null;

    const stepIndex = progress?.currentStep ?? 0;
    const step = chain.steps[stepIndex];
    if (!step) return null;

    const missionId = `chain-${chainKey}-${step.stepIndex}-${missionDate}`;
    const existing = await CityPoiMissionRepository.findById(missionId);
    if (existing) return existing;

    const mission = await buildChainMission(chain, step, missionDate);
    await CityPoiMissionRepository.insert(mission);
    return mission;
  },

  async ensureChainMissionsForPoi(poiKey: string, missionDate: string = getTodayKey()): Promise<void> {
    const chains = await CityPoiChainService.getChainsForPoi(poiKey);
    for (const chain of chains) {
      if (chain.isComplete) continue;
      await CityPoiChainService.getActiveChainMission(poiKey, chain.chainKey, missionDate);
    }
  },

  async onChainMissionClaimed(mission: CityPoiMission): Promise<void> {
    if (!mission.chainKey || mission.chainStep === null) return;

    const chain = POI_CHAINS_BY_KEY[mission.chainKey];
    if (!chain) return;

    const now = new Date().toISOString();
    const progress = await CityPoiChainRepository.findOne(mission.poiKey, mission.chainKey);
    const nextStep = (progress?.currentStep ?? mission.chainStep) + 1;
    const completed = nextStep >= chain.steps.length;

    await CityPoiChainRepository.upsert({
      poiKey: mission.poiKey,
      chainKey: mission.chainKey,
      currentStep: completed ? chain.steps.length : nextStep,
      completed,
      updatedAt: now,
    });

    GameEvents.emit({
      type: 'POI_CHAIN_STEP_CLAIMED',
      poiKey: mission.poiKey,
      chainKey: mission.chainKey,
      stepIndex: mission.chainStep,
      chainTitle: chain.title,
    });

    if (completed) {
      GameEvents.emit({
        type: 'POI_CHAIN_COMPLETED',
        poiKey: mission.poiKey,
        chainKey: mission.chainKey,
        chainTitle: chain.title,
      });
      return;
    }

    await CityPoiChainService.getActiveChainMission(mission.poiKey, mission.chainKey);
  },
};
