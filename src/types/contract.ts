import { LootBoxRarity } from './inventory';

export const ContractStatus = {
  AVAILABLE: 'available',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type ContractStatusValue = (typeof ContractStatus)[keyof typeof ContractStatus];

export const ContractRewardType = {
  COINS: 'coins',
  SHIELD: 'shield',
  LOOT_BOX: 'loot_box',
} as const;

export type ContractRewardTypeValue =
  (typeof ContractRewardType)[keyof typeof ContractRewardType];

export type ContractReward =
  | { type: typeof ContractRewardType.COINS; amount: number; label: string }
  | { type: typeof ContractRewardType.SHIELD; amount: number; label: string }
  | {
      type: typeof ContractRewardType.LOOT_BOX;
      rarity: (typeof LootBoxRarity)[keyof typeof LootBoxRarity];
      quantity: number;
      label: string;
    };

export type ContractDefinition = {
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
  rewards: ContractReward[];
  /** Contrato temático — só ofertado durante o evento */
  eventKey?: string;
};

export type ContractRunRecord = {
  id: number;
  contractKey: string;
  issuerPoiKey: string | null;
  status: Exclude<ContractStatusValue, 'available'>;
  targetDays: number;
  progressDays: number;
  stakeAmount: number;
  startedAt: string;
  endedAt: string | null;
  lastProgressAt: string | null;
};

export type ContractRunViewModel = ContractRunRecord & {
  name: string;
  description: string;
  objective: string;
  icon: string;
  rewards: ContractReward[];
  daysRemaining: number;
  issuerPoiName: string;
  issuerPoiIcon: string;
};

export type PoiContractsState = {
  available: ContractDefinition[];
  activeHere: ContractRunViewModel | null;
  activeElsewhere: {
    issuerPoiKey: string;
    issuerPoiName: string;
    contractName: string;
  } | null;
};

export type ContractAnalyticsRecord = {
  totalAccepted: number;
  totalCompleted: number;
  totalFailed: number;
  totalCoinsStaked: number;
  totalCoinsWon: number;
  totalCoinsLost: number;
  totalShieldsGranted: number;
  totalLootBoxesGranted: number;
  largestContractCompletedKey: string | null;
  lastContractAt: string | null;
};

export type ContractAnalyticsSummary = ContractAnalyticsRecord & {
  successRate: number;
};

export type ContractAcceptResult =
  | { success: true; run: ContractRunRecord }
  | {
      success: false;
      reason:
        | 'already_active'
        | 'insufficient_coins'
        | 'not_found'
        | 'wrong_issuer'
        | 'requirements_not_met';
    };

export type ContractCompletionPayload = {
  run: ContractRunRecord;
  definition: ContractDefinition;
  rewards: ContractReward[];
};
