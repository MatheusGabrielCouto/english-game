import { CONTRACT_DEFINITIONS, CONTRACTS_BY_ISSUER_POI } from '@/data/loaders/contracts';
import { CityEventScheduler } from '@/features/city/services/city-event-scheduler';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { getPlayer } from '@/storage/repositories/player-repository';
import {
    ContractRewardType,
    ContractStatus,
    type ContractAnalyticsRecord,
    type ContractDefinition,
    type ContractRunRecord,
    type ContractRunViewModel,
} from '@/types/contract';

import { CONTRACTS_BY_KEY } from '../constants/default-contracts';
import {
    getIssuerPoiLabel,
    isContractEligible,
    MAX_CONTRACTS_PER_POI,
    resolveIssuerPoiKey,
    sortContractsForPoi,
} from './eligibility';

export const buildContractViewModel = (
  run: ContractRunRecord,
  definition: ContractDefinition,
): ContractRunViewModel => {
  const issuerPoiKey = resolveIssuerPoiKey(definition, run.issuerPoiKey);
  const issuer = getIssuerPoiLabel(issuerPoiKey);

  return {
    ...run,
    issuerPoiKey,
    name: definition.name,
    description: definition.description,
    objective: definition.objective,
    icon: definition.icon,
    rewards: definition.rewards,
    daysRemaining: Math.max(definition.targetDays - run.progressDays, 0),
    issuerPoiName: issuer.name,
    issuerPoiIcon: issuer.icon,
  };
};

export const buildAnalyticsSummary = (analytics: ContractAnalyticsRecord) => {
  const attempts = analytics.totalCompleted + analytics.totalFailed;
  const successRate = attempts > 0 ? Math.round((analytics.totalCompleted / attempts) * 100) : 0;

  return {
    ...analytics,
    successRate,
  };
};

export const getAvailableContractKeysSync = (
  activeRun: ContractRunRecord | null,
  eligibleKeys: string[],
): string[] => {
  if (activeRun) return [];
  return eligibleKeys;
};

const matchesEventWindow = (definition: ContractDefinition): boolean => {
  const activeEventKey = CityEventScheduler.getActiveMajorEvent()?.eventKey ?? null;
  if (definition.eventKey) return definition.eventKey === activeEventKey;
  return true;
};

export const computeEligibleContractKeys = async (): Promise<string[]> => {
  const player = await getPlayer();
  const playerLevel = player?.level ?? 1;
  const poiRecords = await CityPoiRepository.findAll();
  const poiByKey = new Map(poiRecords.map((poi) => [poi.poiKey, poi]));

  return CONTRACT_DEFINITIONS.filter(
    (definition) =>
      matchesEventWindow(definition) &&
      isContractEligible(definition, playerLevel, poiByKey.get(definition.issuerPoiKey)),
  ).map((definition) => definition.key);
};

export const getContractsForPoiKey = async (
  poiKey: string,
  activeRun: ContractRunRecord | null,
): Promise<{
  available: ContractDefinition[];
  activeHere: ContractRunViewModel | null;
  activeElsewhere: {
    issuerPoiKey: string;
    issuerPoiName: string;
    contractName: string;
  } | null;
}> => {
  const player = await getPlayer();
  const playerLevel = player?.level ?? 1;
  const poiRecord = await CityPoiRepository.findByKey(poiKey);
  const pool = CONTRACTS_BY_ISSUER_POI[poiKey] ?? [];

  const available = sortContractsForPoi(
    pool.filter(
      (definition) =>
        matchesEventWindow(definition) &&
        isContractEligible(definition, playerLevel, poiRecord ?? undefined),
    ),
  ).slice(0, MAX_CONTRACTS_PER_POI);

  if (!activeRun) {
    return { available, activeHere: null, activeElsewhere: null };
  }

  const definition = CONTRACTS_BY_KEY[activeRun.contractKey];
  if (!definition) {
    return { available, activeHere: null, activeElsewhere: null };
  }

  const issuerPoiKey = resolveIssuerPoiKey(definition, activeRun.issuerPoiKey);
  const activeViewModel = buildContractViewModel(activeRun, definition);

  if (issuerPoiKey === poiKey) {
    return { available: [], activeHere: activeViewModel, activeElsewhere: null };
  }

  const issuer = getIssuerPoiLabel(issuerPoiKey);

  return {
    available: [],
    activeHere: null,
    activeElsewhere: {
      issuerPoiKey,
      issuerPoiName: issuer.name,
      contractName: definition.name,
    },
  };
};

export const getStatusLabel = (status: ContractRunRecord['status']): string => {
  switch (status) {
    case ContractStatus.ACTIVE:
      return 'Ativo';
    case ContractStatus.COMPLETED:
      return 'Concluído';
    case ContractStatus.FAILED:
      return 'Falhou';
    default:
      return status;
  }
};

export const sumRewardCoins = (rewards: ContractDefinition['rewards']): number =>
  rewards
    .filter((reward) => reward.type === ContractRewardType.COINS)
    .reduce((sum, reward) => sum + reward.amount, 0);

export const sumRewardShields = (rewards: ContractDefinition['rewards']): number =>
  rewards
    .filter((reward) => reward.type === ContractRewardType.SHIELD)
    .reduce((sum, reward) => sum + reward.amount, 0);

export const sumRewardLootBoxes = (rewards: ContractDefinition['rewards']): number =>
  rewards
    .filter((reward) => reward.type === ContractRewardType.LOOT_BOX)
    .reduce((sum, reward) => sum + reward.quantity, 0);
