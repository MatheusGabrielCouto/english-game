import { haptics } from '@/utils/haptics';

import { grantLootBoxReward } from '@/features/loot-boxes/services/loot-box-grant';
import { PlayerService } from '@/features/player/services/player-service';
import { PetService } from '@/features/pet/services/pet-service';
import { diffDays } from '@/features/streak/utils/date';
import { getTodayKey } from '@/features/quests/utils/date';
import {
  INACTIVITY_DAYS,
  PENALTY_PRESETS,
  RECOVERY_BONUS,
  RECOVERY_THRESHOLDS,
  TRIGGER_SEVERITY,
} from '@/features/punishments/constants/punishment-catalog';
import { buildPunishmentWarning } from '@/features/punishments/constants/punishment-messages';
import { GameEvents, type GameEvent } from '@/services/game-events';
import {
  getOrCreatePunishmentAnalytics,
  recordPunishmentApplied,
  recordPunishmentRecovered,
} from '@/storage/repositories/punishment-analytics-repository';
import { appendPunishmentHistory, markActivePenaltiesRecovered } from '@/storage/repositories/punishment-history-repository';
import {
  getOrCreatePunishmentState,
  savePunishmentState,
} from '@/storage/repositories/punishment-state-repository';
import { LootBoxRarity } from '@/types/inventory';
import {
  PunishmentSeverity,
  PunishmentTrigger,
  type ActivePenalty,
  type PunishmentRecoveryResult,
  type PunishmentSeverityValue,
  type PunishmentState,
  type PunishmentTriggerValue,
} from '@/types/punishment';

import { usePunishmentStore } from '../store/punishment-store';
import {
  aggregatePenalties,
  filterExpiredPenalties,
  removePenaltiesBySeverity,
  syncStateDerivedFields,
} from '../utils/aggregate-penalties';

let listenersInitialized = false;

const createPenaltyId = (): string =>
  `penalty_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const syncStore = (
  state: PunishmentState,
  analytics: Awaited<ReturnType<typeof getOrCreatePunishmentAnalytics>>,
  modal: ReturnType<typeof usePunishmentStore.getState>['modal'] = 'none',
  extras?: Partial<ReturnType<typeof usePunishmentStore.getState>>,
) => {
  usePunishmentStore.setState({
    state,
    analytics,
    aggregated: aggregatePenalties(state.activePenalties),
    modal,
    isLoading: false,
    ...extras,
  });
};

const buildPenalty = (
  trigger: PunishmentTriggerValue,
  severity: PunishmentSeverityValue,
): ActivePenalty => {
  const preset = PENALTY_PRESETS[severity];
  const appliedAt = new Date().toISOString();
  const expiresAt = preset.durationHours
    ? new Date(Date.now() + preset.durationHours * 60 * 60 * 1000).toISOString()
    : null;

  return {
    id: createPenaltyId(),
    trigger,
    severity,
    xpDecayPercent: preset.xpDecayPercent,
    coinDecayPercent: preset.coinDecayPercent,
    lootLuckReduction: preset.lootLuckReduction,
    contractPenalty: preset.contractPenalty,
    petMoodOverride: preset.petMoodOverride,
    cityVibrancy: preset.cityVibrancy,
    appliedAt,
    expiresAt,
  };
};

export const PunishmentService = {
  initListeners(): void {
    if (listenersInitialized) return;
    listenersInitialized = true;

    GameEvents.subscribe((event) => {
      void PunishmentService.handleGameEvent(event);
    });
  },

  async handleGameEvent(event: GameEvent): Promise<void> {
    switch (event.type) {
      case 'STREAK_BROKEN':
        await PunishmentService.queueWarning(PunishmentTrigger.STREAK_BROKEN);
        await PetService.updateMood();
        break;
      case 'CONTRACT_FAILED':
        await PunishmentService.queueWarning(PunishmentTrigger.CONTRACT_FAILED);
        break;
      case 'FOCUS_SESSION_ABANDONED':
        await PunishmentService.queueWarning(PunishmentTrigger.FOCUS_ABANDONED);
        break;
      case 'FOCUS_SESSION_COMPLETED':
        if (
          event.rewards.focusRatio < 0.4 ||
          event.distractedSeconds > event.focusedSeconds
        ) {
          await PunishmentService.queueWarning(PunishmentTrigger.FOCUS_DISTRACTION);
        }
        break;
      case 'STUDY_DAY_RECORDED':
        await PunishmentService.processRecovery();
        break;
      default:
        break;
    }
  },

  async initialize(): Promise<void> {
    let state = syncStateDerivedFields(await getOrCreatePunishmentState());
    const analytics = await getOrCreatePunishmentAnalytics();

    await PunishmentService.evaluateInactivity(state);

    state = syncStateDerivedFields(await getOrCreatePunishmentState());
    state = syncStateDerivedFields({
      ...state,
      lastAppOpenAt: getTodayKey(),
    });
    await savePunishmentState(state);

    if (state.pendingWarning) {
      syncStore(state, analytics, 'warning');
      return;
    }

    syncStore(state, analytics, 'none');
  },

  async refresh(): Promise<void> {
    const state = syncStateDerivedFields(await getOrCreatePunishmentState());
    const analytics = await getOrCreatePunishmentAnalytics();
    syncStore(state, analytics, usePunishmentStore.getState().modal);
  },

  async evaluateInactivity(state: PunishmentState): Promise<void> {
    if (!state.lastAppOpenAt) return;

    const daysAway = diffDays(state.lastAppOpenAt, getTodayKey());
    if (daysAway < INACTIVITY_DAYS.light) return;

    const severity =
      daysAway >= INACTIVITY_DAYS.medium
        ? PunishmentSeverity.MEDIUM
        : PunishmentSeverity.LIGHT;

    await PunishmentService.queueWarning(PunishmentTrigger.INACTIVITY, severity);
  },

  async queueWarning(
    trigger: PunishmentTriggerValue,
    severityOverride?: PunishmentSeverityValue,
  ): Promise<void> {
    const severity = severityOverride ?? TRIGGER_SEVERITY[trigger];
    const warning = {
      ...buildPunishmentWarning(trigger),
      severity,
    };

    const state = syncStateDerivedFields(await getOrCreatePunishmentState());
    state.pendingWarning = warning;
    await savePunishmentState(state);

    const analytics = await getOrCreatePunishmentAnalytics();
    syncStore(state, analytics, 'warning');

    haptics.warning();

    GameEvents.emit({
      type: 'PUNISHMENT_WARNING',
      trigger,
      severity,
      message: warning.message,
    });
  },

  async confirmPendingWarning(): Promise<void> {
    const state = await getOrCreatePunishmentState();
    const warning = state.pendingWarning;
    if (!warning) return;

    const penalty = buildPenalty(warning.trigger, warning.severity);
    const nextState = syncStateDerivedFields({
      ...state,
      activePenalties: [...filterExpiredPenalties(state.activePenalties), penalty],
      pendingWarning: null,
    });

    await savePunishmentState(nextState);
    await appendPunishmentHistory(penalty);
    await recordPunishmentApplied(warning.trigger);
    await PetService.updateMood();

    const analytics = await getOrCreatePunishmentAnalytics();
    syncStore(nextState, analytics, 'impact', { lastApplied: penalty });

    GameEvents.emit({
      type: 'PUNISHMENT_APPLIED',
      trigger: penalty.trigger,
      severity: penalty.severity,
      xpDecayPercent: penalty.xpDecayPercent,
      coinDecayPercent: penalty.coinDecayPercent,
    });
  },

  async dismissImpactModal(): Promise<void> {
    usePunishmentStore.setState({ modal: 'none', lastApplied: null });
  },

  async processRecovery(): Promise<PunishmentRecoveryResult | null> {
    const state = syncStateDerivedFields(await getOrCreatePunishmentState());
    const recoveryDays = state.recoveryStreakDays + 1;
    let remaining = filterExpiredPenalties(state.activePenalties);
    let removed: ActivePenalty[] = [];

    if (recoveryDays >= RECOVERY_THRESHOLDS.removeAll) {
      removed = remaining;
      remaining = [];
    } else if (recoveryDays >= RECOVERY_THRESHOLDS.removeMedium) {
      const result = removePenaltiesBySeverity(remaining, [PunishmentSeverity.MEDIUM]);
      remaining = result.remaining;
      removed = [...removed, ...result.removed];
    }

    if (recoveryDays >= RECOVERY_THRESHOLDS.removeLight) {
      const result = removePenaltiesBySeverity(remaining, [PunishmentSeverity.LIGHT]);
      remaining = result.remaining;
      removed = [...removed, ...result.removed];
    }

    if (removed.length === 0) {
      const nextState = syncStateDerivedFields({
        ...state,
        recoveryStreakDays: recoveryDays,
        lastRecoveryAt: new Date().toISOString(),
      });
      await savePunishmentState(nextState);
      return null;
    }

    const allCleared = remaining.length === 0;
    const bonusTier = allCleared ? 'full' : recoveryDays >= 3 ? 'medium' : 'light';
    const bonus = RECOVERY_BONUS[bonusTier];

    PlayerService.addXP(bonus.xp);
    PlayerService.addCoins(bonus.coins);

    if ('lootBoxRoll' in bonus && Math.random() < bonus.lootBoxRoll) {
      await grantLootBoxReward(LootBoxRarity.COMMON, 'punishment_recovery');
    }

    const now = new Date().toISOString();
    await markActivePenaltiesRecovered(now);
    await recordPunishmentRecovered(recoveryDays);
    await PetService.updateMood();

    const nextState = syncStateDerivedFields({
      ...state,
      activePenalties: remaining,
      recoveryStreakDays: allCleared ? 0 : recoveryDays,
      lastRecoveryAt: now,
    });
    await savePunishmentState(nextState);

    const result: PunishmentRecoveryResult = {
      removedCount: removed.length,
      recoveryDays,
      bonusXp: bonus.xp,
      bonusCoins: bonus.coins,
      lootBoxChance: 'lootBoxRoll' in bonus,
      allCleared,
    };

    const analytics = await getOrCreatePunishmentAnalytics();
    syncStore(nextState, analytics, 'recovery', { lastRecovery: result });

    GameEvents.emit({
      type: 'PUNISHMENT_RECOVERED',
      recoveryDays,
      bonusXp: bonus.xp,
      allCleared,
    });

    return result;
  },

  async dismissRecoveryModal(): Promise<void> {
    usePunishmentStore.setState({ modal: 'none', lastRecovery: null });
  },
};
