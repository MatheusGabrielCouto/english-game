import { create } from 'zustand';

import type {
  ActivePenalty,
  AggregatedPenalties,
  PunishmentAnalytics,
  PunishmentRecoveryResult,
  PunishmentState,
  PunishmentWarning,
} from '@/types/punishment';

type PunishmentModal = 'none' | 'warning' | 'impact' | 'recovery';

type PunishmentStore = {
  state: PunishmentState | null;
  analytics: PunishmentAnalytics | null;
  aggregated: AggregatedPenalties;
  modal: PunishmentModal;
  lastApplied: ActivePenalty | null;
  lastRecovery: PunishmentRecoveryResult | null;
  isLoading: boolean;
};

export const usePunishmentStore = create<PunishmentStore>()(() => ({
  state: null,
  analytics: null,
  aggregated: {
    xpDecayPercent: 0,
    coinDecayPercent: 0,
    lootLuckReduction: 0,
    contractPenalty: false,
    cityVibrancy: 100,
    petMoodOverride: null,
    hasActivePenalties: false,
  },
  modal: 'none',
  lastApplied: null,
  lastRecovery: null,
  isLoading: true,
}));

export type { PunishmentModal, PunishmentWarning };
