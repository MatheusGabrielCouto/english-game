import { STAGE_EVOLUTION_REWARDS, STAGE_ORDER } from '@/features/pet/constants';
import { PlayerService } from '@/features/player/services/player-service';
import { GameEvents } from '@/services/game-events';
import { PetAnalyticsRepository } from '@/storage/repositories/pet-analytics-repository';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import { PetStageRewardsRepository } from '@/storage/repositories/pet-stage-rewards-repository';
import { PetStage, type PetStageValue } from '@/types/pet';

const stageRank = (stage: PetStageValue): number => STAGE_ORDER.indexOf(stage);

export const PetEvolutionService = {
  didEvolve(previousStage: PetStageValue, nextStage: PetStageValue): boolean {
    return stageRank(nextStage) > stageRank(previousStage);
  },

  async processEvolution(input: {
    previousStage: PetStageValue;
    nextStage: PetStageValue;
    level: number;
    instanceId?: number;
    nickname?: string;
    speciesKey?: string;
  }): Promise<void> {
    if (!PetEvolutionService.didEvolve(input.previousStage, input.nextStage)) return;

    let instanceId = input.instanceId;
    let nickname = input.nickname;
    let speciesKey = input.speciesKey;

    if (instanceId && (!nickname || !speciesKey)) {
      const row = await PetInstanceRepository.findById(instanceId);
      if (row) {
        nickname = nickname ?? row.nickname;
        speciesKey = speciesKey ?? row.speciesKey;
      }
    }

    if (!instanceId) {
      const active = await PetInstanceRepository.findActive();
      if (active) {
        instanceId = active.id;
        nickname = nickname ?? active.nickname;
        speciesKey = speciesKey ?? active.speciesKey;
      }
    }

    let coinsReward = 0;
    if (input.nextStage !== PetStage.EGG) {
      const reward =
        STAGE_EVOLUTION_REWARDS[input.nextStage as Exclude<PetStageValue, typeof PetStage.EGG>];
      if (reward) {
        const claimed = await PetStageRewardsRepository.isClaimed(input.nextStage);
        if (!claimed) {
          await PetStageRewardsRepository.markClaimed(input.nextStage);
          PlayerService.addCoins(reward.coins);
          coinsReward = reward.coins;
        }
      }
    }

    const analytics = await PetAnalyticsRepository.getOrCreate();
    await PetAnalyticsRepository.save({
      ...analytics,
      totalEvolutions: analytics.totalEvolutions + 1,
      currentLevel: input.level,
      currentStage: input.nextStage,
    });

    GameEvents.emit({
      type: 'PET_STAGE_EVOLVED',
      stage: input.nextStage,
      previousStage: input.previousStage,
      instanceId,
      nickname,
      speciesKey,
      coinsReward,
    });
  },
};
