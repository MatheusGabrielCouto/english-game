import { EXTENDED_CONTRACTS } from '@/features/game-design/catalogs/extended-content';
import {
    ContractRewardType,
    type ContractDefinition,
    type ContractReward,
} from '@/types/contract';
import { LootBoxRarity } from '@/types/inventory';

import contractsJson from '../contracts.json';
import { CITY_POIS_BY_KEY } from './city';

type ContractRewardJson =
  | { type: 'coins'; amount: number; label: string }
  | { type: 'shield'; amount: number; label: string }
  | { type: 'loot_box'; rarity: string; quantity: number; label: string };

type ContractJson = {
  key: string;
  name: string;
  description: string;
  objective: string;
  targetDays: number;
  stakeAmount: number;
  icon: string;
  issuerPoiKey: string;
  districtKey: string;
  minPlayerLevel: number;
  minLocalLevel: number;
  baseLocalXpReward: number;
  eventKey?: string;
  rewards: ContractRewardJson[];
};

type ContractsDataFile = {
  version: number;
  contracts: ContractJson[];
};

const POI_ROTATION = [
  'town_hall',
  'central_library',
  'study_cafe',
  'corner_shop',
  'city_park',
  'coworking_hub',
] as const;

const mapReward = (reward: ContractRewardJson): ContractReward => {
  if (reward.type === 'coins') {
    return { type: ContractRewardType.COINS, amount: reward.amount, label: reward.label };
  }
  if (reward.type === 'shield') {
    return { type: ContractRewardType.SHIELD, amount: reward.amount, label: reward.label };
  }

  const rarity =
    reward.rarity === 'epic'
      ? LootBoxRarity.EPIC
      : reward.rarity === 'rare'
        ? LootBoxRarity.RARE
        : LootBoxRarity.COMMON;

  return {
    type: ContractRewardType.LOOT_BOX,
    rarity,
    quantity: reward.quantity,
    label: reward.label,
  };
};

const mapContract = (raw: ContractJson): ContractDefinition => ({
  key: raw.key,
  name: raw.name,
  description: raw.description,
  objective: raw.objective,
  targetDays: raw.targetDays,
  stakeAmount: raw.stakeAmount,
  icon: raw.icon,
  issuerPoiKey: raw.issuerPoiKey,
  districtKey: raw.districtKey,
  minPlayerLevel: raw.minPlayerLevel,
  minLocalLevel: raw.minLocalLevel,
  baseLocalXpReward: raw.baseLocalXpReward,
  eventKey: raw.eventKey,
  rewards: raw.rewards.map(mapReward),
});

const data = contractsJson as ContractsDataFile;

const baseContracts = data.contracts.map(mapContract);

const extendedContracts: ContractDefinition[] = EXTENDED_CONTRACTS.map((contract, index) => {
  const issuerPoiKey = POI_ROTATION[index % POI_ROTATION.length];
  const poi = CITY_POIS_BY_KEY[issuerPoiKey];

  return {
    ...contract,
    issuerPoiKey,
    districtKey: poi?.districtKey ?? 'centro',
    minPlayerLevel: 8 + Math.floor(index / 2),
    minLocalLevel: 1 + (index % 3),
    baseLocalXpReward: 35 + index * 4,
  };
});

export const CONTRACT_DEFINITIONS: ContractDefinition[] = [
  ...baseContracts,
  ...extendedContracts,
];

export const CONTRACTS_BY_KEY = Object.fromEntries(
  CONTRACT_DEFINITIONS.map((contract) => [contract.key, contract]),
) as Record<string, ContractDefinition>;

export const CONTRACT_ORDER = CONTRACT_DEFINITIONS.map((contract) => contract.key);

export const CONTRACTS_BY_ISSUER_POI = CONTRACT_DEFINITIONS.reduce<
  Record<string, ContractDefinition[]>
>((acc, contract) => {
  const list = acc[contract.issuerPoiKey] ?? [];
  list.push(contract);
  acc[contract.issuerPoiKey] = list;
  return acc;
}, {});
