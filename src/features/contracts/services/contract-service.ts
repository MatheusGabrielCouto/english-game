import { CityMapService } from '@/features/city/services/city-map-service';
import { useCityMapStore } from '@/features/city/store/city-map-store';
import { applyLocalXpToPoi } from '@/features/city/utils/apply-local-xp';
import { RewardModifierService } from '@/features/game-design/services/reward-modifier-service';
import { LootBoxService } from '@/features/loot-boxes/services/loot-box-service';
import { PlayerService } from '@/features/player/services/player-service';
import { PunishmentModifierService } from '@/features/punishments/services/punishment-modifier-service';
import { getTodayKey } from '@/features/quests/utils/date';
import { ShieldService } from '@/features/shields/services/shield-service';
import { GameEvents, type GameEvent } from '@/services/game-events';
import { CityPoiRepository } from '@/storage/repositories/city-poi-repository';
import { ContractAnalyticsRepository } from '@/storage/repositories/contract-analytics-repository';
import { ContractRunRepository } from '@/storage/repositories/contract-run-repository';
import { getPlayer } from '@/storage/repositories/player-repository';
import {
    ContractRewardType,
    ContractStatus,
    type ContractAcceptResult,
    type ContractAnalyticsRecord,
    type ContractCompletionPayload,
    type ContractDefinition,
    type ContractReward,
    type ContractRunRecord,
    type ContractRunViewModel,
    type PoiContractsState,
} from '@/types/contract';

import {
    CONTRACT_DEFINITIONS,
    CONTRACT_MESSAGES,
    CONTRACTS_BY_KEY,
} from '../constants/default-contracts';
import { useContractsStore } from '../store/contracts-store';
import { isContractEligible, resolveIssuerPoiKey } from '../utils/eligibility';
import {
    buildAnalyticsSummary,
    buildContractViewModel,
    computeEligibleContractKeys,
    getAvailableContractKeysSync,
    getContractsForPoiKey,
    sumRewardCoins,
    sumRewardLootBoxes,
    sumRewardShields,
} from '../utils/progress';

let listenersInitialized = false;
let cachedActive: ContractRunRecord | null = null;
let cachedHistory: ContractRunRecord[] = [];
let cachedAnalytics: ContractAnalyticsRecord | null = null;

const syncActiveIssuerHighlight = (): void => {
  if (!cachedActive) {
    useCityMapStore.setState({ activeContractIssuerPoiKey: null });
    return;
  }

  const definition = CONTRACTS_BY_KEY[cachedActive.contractKey];
  const issuerPoiKey = definition
    ? resolveIssuerPoiKey(definition, cachedActive.issuerPoiKey)
    : cachedActive.issuerPoiKey;

  useCityMapStore.setState({ activeContractIssuerPoiKey: issuerPoiKey ?? null });
};

const refreshStore = async (): Promise<void> => {
  cachedActive = await ContractRunRepository.findActive();
  cachedHistory = await ContractRunRepository.findRecent();
  cachedAnalytics = await ContractAnalyticsRepository.getOrCreate();

  const eligibleKeys = await computeEligibleContractKeys();

  const activeViewModel =
    cachedActive && CONTRACTS_BY_KEY[cachedActive.contractKey]
      ? buildContractViewModel(cachedActive, CONTRACTS_BY_KEY[cachedActive.contractKey])
      : null;

  useContractsStore.setState({
    activeContract: activeViewModel,
    history: cachedHistory,
    analytics: buildAnalyticsSummary(cachedAnalytics),
    availableKeys: getAvailableContractKeysSync(cachedActive, eligibleKeys),
    isLoading: false,
  });

  syncActiveIssuerHighlight();
};

const applyReward = async (reward: ContractReward): Promise<void> => {
  const modifiers = RewardModifierService.getModifiersSync();
  const contractPenaltyScale = PunishmentModifierService.hasContractPenalty() ? 0.9 : 1;
  const contractScale =
    (1 + modifiers.contractRewardPercent / 100) *
    modifiers.contractRewardMultiplier *
    contractPenaltyScale;

  switch (reward.type) {
    case ContractRewardType.COINS:
      PlayerService.addCoins(Math.round(reward.amount * contractScale));
      break;
    case ContractRewardType.SHIELD:
      await ShieldService.grantShields(reward.amount, 'contract');
      break;
    case ContractRewardType.LOOT_BOX:
      for (let index = 0; index < reward.quantity; index += 1) {
        await LootBoxService.grantLootBox(reward.rarity, 'contract');
      }
      break;
    default:
      break;
  }
};

const deliverRewards = async (definition: ContractDefinition): Promise<void> => {
  for (const reward of definition.rewards) {
    await applyReward(reward);
  }
};

const grantLocalXpToIssuer = async (
  definition: ContractDefinition,
  run: ContractRunRecord,
): Promise<void> => {
  const issuerPoiKey = resolveIssuerPoiKey(definition, run.issuerPoiKey);
  const result = await applyLocalXpToPoi(issuerPoiKey, definition.baseLocalXpReward);
  if (result) {
    await CityMapService.refresh();
  }
};

const completeActiveContract = async (
  run: ContractRunRecord,
  definition: ContractDefinition,
): Promise<ContractCompletionPayload> => {
  const endedAt = new Date().toISOString();
  const progressDays = definition.targetDays;
  const issuerPoiKey = resolveIssuerPoiKey(definition, run.issuerPoiKey);

  await ContractRunRepository.complete({ id: run.id, endedAt, progressDays });
  await deliverRewards(definition);
  await grantLocalXpToIssuer(definition, run);

  await ContractAnalyticsRepository.recordCompleted({
    contractKey: definition.key,
    targetDays: definition.targetDays,
    coinsWon: sumRewardCoins(definition.rewards),
    shieldsGranted: sumRewardShields(definition.rewards),
    lootBoxesGranted: sumRewardLootBoxes(definition.rewards),
    completedAt: endedAt,
  });

  GameEvents.emit({
    type: 'CONTRACT_COMPLETED',
    contractKey: definition.key,
    contractName: definition.name,
    targetDays: definition.targetDays,
    stakeAmount: run.stakeAmount,
    issuerPoiKey,
  });

  await refreshStore();

  useContractsStore.getState().showToast(
    `${CONTRACT_MESSAGES.completed} ${CONTRACT_MESSAGES.rewardsDelivered} ${CONTRACT_MESSAGES.localXpGranted}`,
  );

  return {
    run: { ...run, status: ContractStatus.COMPLETED, progressDays, endedAt },
    definition,
    rewards: definition.rewards,
  };
};

const failActiveContract = async (run: ContractRunRecord): Promise<void> => {
  const endedAt = new Date().toISOString();
  const definition = CONTRACTS_BY_KEY[run.contractKey];
  const issuerPoiKey = definition
    ? resolveIssuerPoiKey(definition, run.issuerPoiKey)
    : run.issuerPoiKey ?? 'town_hall';

  await ContractRunRepository.fail({ id: run.id, endedAt });
  await ContractAnalyticsRepository.recordFailed({
    stakeAmount: run.stakeAmount,
    failedAt: endedAt,
  });

  GameEvents.emit({
    type: 'CONTRACT_FAILED',
    contractKey: run.contractKey,
    contractName: definition?.name ?? run.contractKey,
    stakeAmount: run.stakeAmount,
    issuerPoiKey,
  });

  await refreshStore();
  useContractsStore.getState().showToast(CONTRACT_MESSAGES.failed, 'info');
};

const handleStudyDayRecorded = async (): Promise<void> => {
  const active = cachedActive ?? (await ContractRunRepository.findActive());
  if (!active) return;

  const definition = CONTRACTS_BY_KEY[active.contractKey];
  if (!definition) return;

  const today = getTodayKey();
  if (active.lastProgressAt === today) return;

  const nextProgress = active.progressDays + 1;

  if (nextProgress >= definition.targetDays) {
    await completeActiveContract(active, definition);
    return;
  }

  await ContractRunRepository.updateProgress({
    id: active.id,
    progressDays: nextProgress,
    lastProgressAt: today,
  });

  cachedActive = {
    ...active,
    progressDays: nextProgress,
    lastProgressAt: today,
  };

  await refreshStore();
  useContractsStore.getState().showToast(CONTRACT_MESSAGES.progress, 'info');
};

const handleStreakBroken = async (): Promise<void> => {
  const active = cachedActive ?? (await ContractRunRepository.findActive());
  if (!active) return;

  await failActiveContract(active);
};

const handleGameEvent = async (event: GameEvent): Promise<void> => {
  if (event.type === 'STUDY_DAY_RECORDED') {
    await handleStudyDayRecorded();
    return;
  }

  if (event.type === 'STREAK_BROKEN') {
    await handleStreakBroken();
  }
};

export const ContractService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void handleGameEvent(event);
    });
  },

  async initialize(): Promise<void> {
    await refreshStore();
  },

  async refresh(): Promise<void> {
    await refreshStore();
  },

  getDefinitions(): ContractDefinition[] {
    return CONTRACT_DEFINITIONS;
  },

  getDefinition(key: string): ContractDefinition | undefined {
    return CONTRACTS_BY_KEY[key];
  },

  getCachedActive(): ContractRunViewModel | null {
    const active = cachedActive;
    if (!active) return null;
    const definition = CONTRACTS_BY_KEY[active.contractKey];
    if (!definition) return null;
    return buildContractViewModel(active, definition);
  },

  async getContractsForPoi(poiKey: string): Promise<PoiContractsState> {
    const active = cachedActive ?? (await ContractRunRepository.findActive());
    return getContractsForPoiKey(poiKey, active);
  },

  async acceptContract(
    contractKey: string,
    issuerPoiKey?: string,
  ): Promise<ContractAcceptResult> {
    const definition = CONTRACTS_BY_KEY[contractKey];
    if (!definition) return { success: false, reason: 'not_found' };

    const expectedIssuer = issuerPoiKey ?? definition.issuerPoiKey;
    if (expectedIssuer !== definition.issuerPoiKey) {
      return { success: false, reason: 'wrong_issuer' };
    }

    const active = await ContractRunRepository.findActive();
    if (active) return { success: false, reason: 'already_active' };

    const player = await getPlayer();
    const playerLevel = player?.level ?? 1;
    const poiRecord = await CityPoiRepository.findByKey(definition.issuerPoiKey);

    if (!isContractEligible(definition, playerLevel, poiRecord ?? undefined)) {
      return { success: false, reason: 'requirements_not_met' };
    }

    const coins = player?.coins ?? 0;
    const modifiers = RewardModifierService.getModifiersSync();
    const stakeAmount = Math.round(definition.stakeAmount * modifiers.contractStakeMultiplier);
    if (coins < stakeAmount) {
      return { success: false, reason: 'insufficient_coins' };
    }

    const deducted = PlayerService.removeCoins(stakeAmount);
    if (!deducted) return { success: false, reason: 'insufficient_coins' };

    const startedAt = new Date().toISOString();
    const run = await ContractRunRepository.create({
      contractKey: definition.key,
      issuerPoiKey: definition.issuerPoiKey,
      targetDays: definition.targetDays,
      stakeAmount,
      startedAt,
    });

    await ContractAnalyticsRepository.recordAccepted({
      stakeAmount,
      acceptedAt: startedAt,
    });

    GameEvents.emit({
      type: 'CONTRACT_STARTED',
      contractKey: definition.key,
      contractName: definition.name,
      targetDays: definition.targetDays,
      stakeAmount,
      issuerPoiKey: definition.issuerPoiKey,
    });

    await refreshStore();
    useContractsStore.getState().showToast(CONTRACT_MESSAGES.started);

    return { success: true, run };
  },
};
