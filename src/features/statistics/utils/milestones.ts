import { ACHIEVEMENT_DEFINITIONS } from '@/features/achievements/constants/default-achievements';
import { BUILDING_DEFINITIONS } from '@/features/city/constants/default-buildings';
import { CONTRACTS_BY_KEY } from '@/features/contracts/constants/default-contracts';
import { STAGE_CONFIG } from '@/features/pet/constants';
import { TITLE_DEFINITIONS } from '@/features/titles/constants/default-titles';
import { AchievementUnlockRepository } from '@/storage/repositories/achievement-unlock-repository';
import { CityBuildingUnlockRepository } from '@/storage/repositories/city-building-unlock-repository';
import { ContractRunRepository } from '@/storage/repositories/contract-run-repository';
import { LootBoxOpenHistoryRepository } from '@/storage/repositories/loot-box-open-history-repository';
import { PetStageRewardsRepository } from '@/storage/repositories/pet-stage-rewards-repository';
import { StatisticsMilestoneRepository } from '@/storage/repositories/statistics-milestone-repository';
import { StudyDaysRepository } from '@/storage/repositories/study-days-repository';
import { TitleUnlockRepository } from '@/storage/repositories/title-unlock-repository';
import { ContractStatus } from '@/types/contract';
import { StatisticsMilestoneCategory, type StatisticsMilestoneCategoryValue } from '@/types/statistics';

import { buildMilestoneKey } from './metrics';

export const recordStatisticsMilestone = async (params: {
  category: StatisticsMilestoneCategoryValue;
  milestoneKey: string;
  label: string;
  value?: number | null;
  metadataJson?: string | null;
  occurredAt?: string;
}): Promise<void> => {
  await StatisticsMilestoneRepository.create({
    category: params.category,
    milestoneKey: buildMilestoneKey(params.category, params.milestoneKey),
    label: params.label,
    value: params.value ?? null,
    metadataJson: params.metadataJson ?? null,
    occurredAt: params.occurredAt ?? new Date().toISOString(),
  });
};

export const backfillStatisticsMilestones = async (): Promise<void> => {
  const existingCount = await StatisticsMilestoneRepository.countAll();
  if (existingCount > 0) return;

  const earliestStudyDay = await StudyDaysRepository.findEarliest();

  if (earliestStudyDay) {
    await recordStatisticsMilestone({
      category: StatisticsMilestoneCategory.STUDY,
      milestoneKey: 'first_study_day',
      label: 'Primeiro dia estudado',
      occurredAt: earliestStudyDay.recordedAt,
    });
  }

  const achievementUnlocks = await AchievementUnlockRepository.findAll();
  for (const unlock of achievementUnlocks) {
    const definition = ACHIEVEMENT_DEFINITIONS.find((item) => item.key === unlock.achievementKey);
    if (!definition) continue;

    await recordStatisticsMilestone({
      category: StatisticsMilestoneCategory.ACHIEVEMENT,
      milestoneKey: unlock.achievementKey,
      label: `Conquista: ${definition.name}`,
      occurredAt: unlock.unlockedAt,
    });
  }

  const titleUnlocks = await TitleUnlockRepository.findAll();
  for (const unlock of titleUnlocks) {
    const title = TITLE_DEFINITIONS.find((item) => item.key === unlock.titleKey);
    await recordStatisticsMilestone({
      category: StatisticsMilestoneCategory.TITLE,
      milestoneKey: unlock.titleKey,
      label: title ? `Título: ${title.name}` : `Título desbloqueado`,
      occurredAt: unlock.unlockedAt,
    });
  }

  const buildingUnlocks = await CityBuildingUnlockRepository.findAll();
  for (const unlock of buildingUnlocks) {
    const building = BUILDING_DEFINITIONS.find((item) => item.key === unlock.buildingKey);
    await recordStatisticsMilestone({
      category: StatisticsMilestoneCategory.CITY,
      milestoneKey: unlock.buildingKey,
      label: building ? `Construção: ${building.name}` : `Construção: ${unlock.buildingKey}`,
      occurredAt: unlock.unlockedAt,
    });
  }

  const contractHistory = await ContractRunRepository.findRecent(50);
  for (const run of contractHistory) {
    if (run.status !== ContractStatus.COMPLETED) continue;

    const definition = CONTRACTS_BY_KEY[run.contractKey];
    await recordStatisticsMilestone({
      category: StatisticsMilestoneCategory.CONTRACT,
      milestoneKey: `completed_${run.id}`,
      label: definition ? `Contrato: ${definition.name}` : `Contrato concluído`,
      value: run.targetDays,
      occurredAt: run.endedAt ?? run.startedAt,
    });
  }

  const lootHistory = await LootBoxOpenHistoryRepository.findRecent(1);
  if (lootHistory[0]) {
    await recordStatisticsMilestone({
      category: StatisticsMilestoneCategory.LOOT_BOX,
      milestoneKey: `first_open_${lootHistory[0].id}`,
      label: 'Primeira Loot Box aberta',
      occurredAt: lootHistory[0].openedAt,
    });
  }

  const petStages = await PetStageRewardsRepository.findAll();
  for (const stage of petStages) {
    const config = STAGE_CONFIG[stage.stage as keyof typeof STAGE_CONFIG];
    await recordStatisticsMilestone({
      category: StatisticsMilestoneCategory.PET,
      milestoneKey: stage.stage,
      label: config ? `Pet evoluiu para ${config.label}` : `Pet evoluiu`,
      occurredAt: stage.claimedAt,
    });
  }
};
