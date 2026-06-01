import { CITY_POIS_BY_KEY } from '@/data/loaders/city';
import type { CityPoiRecord } from '@/types/city-map';
import type { ContractDefinition } from '@/types/contract';

export const MAX_CONTRACTS_PER_POI = 3;

export const isContractEligible = (
  definition: ContractDefinition,
  playerLevel: number,
  poiRecord: CityPoiRecord | undefined,
): boolean => {
  if (!poiRecord?.unlockedAt) return false;
  if (playerLevel < definition.minPlayerLevel) return false;
  if (poiRecord.localLevel < definition.minLocalLevel) return false;
  return true;
};

export const sortContractsForPoi = (
  contracts: ContractDefinition[],
): ContractDefinition[] =>
  [...contracts].sort((a, b) => {
    if (a.minLocalLevel !== b.minLocalLevel) return a.minLocalLevel - b.minLocalLevel;
    if (a.minPlayerLevel !== b.minPlayerLevel) return a.minPlayerLevel - b.minPlayerLevel;
    return a.targetDays - b.targetDays;
  });

export const getIssuerPoiLabel = (issuerPoiKey: string): { name: string; icon: string } => {
  const poi = CITY_POIS_BY_KEY[issuerPoiKey];
  return {
    name: poi?.name ?? issuerPoiKey,
    icon: poi?.icon ?? '📍',
  };
};

export const resolveIssuerPoiKey = (
  definition: ContractDefinition,
  runIssuerPoiKey: string | null,
): string => runIssuerPoiKey ?? definition.issuerPoiKey;
