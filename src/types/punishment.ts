import type { PetMoodValue } from '@/types/pet';

export const PunishmentTrigger = {
  STREAK_BROKEN: 'streak_broken',
  CONTRACT_FAILED: 'contract_failed',
  FOCUS_DISTRACTION: 'focus_distraction',
  FOCUS_ABANDONED: 'focus_abandoned',
  INACTIVITY: 'inactivity',
} as const;

export type PunishmentTriggerValue = (typeof PunishmentTrigger)[keyof typeof PunishmentTrigger];

export const PunishmentSeverity = {
  LIGHT: 'light',
  MEDIUM: 'medium',
} as const;

export type PunishmentSeverityValue = (typeof PunishmentSeverity)[keyof typeof PunishmentSeverity];

export type ActivePenalty = {
  id: string;
  trigger: PunishmentTriggerValue;
  severity: PunishmentSeverityValue;
  xpDecayPercent: number;
  coinDecayPercent: number;
  lootLuckReduction: number;
  contractPenalty: boolean;
  petMoodOverride: PetMoodValue | null;
  cityVibrancy: number;
  appliedAt: string;
  expiresAt: string | null;
};

export type PunishmentWarning = {
  trigger: PunishmentTriggerValue;
  severity: PunishmentSeverityValue;
  title: string;
  message: string;
  petMessage: string;
  impactPreview: string;
};

export type PunishmentState = {
  activePenalties: ActivePenalty[];
  recoveryStreakDays: number;
  lastAppOpenAt: string | null;
  lastRecoveryAt: string | null;
  pendingWarning: PunishmentWarning | null;
  cityVibrancy: number;
  updatedAt: string;
};

export type PunishmentHistoryEntry = {
  id: number;
  trigger: PunishmentTriggerValue;
  severity: PunishmentSeverityValue;
  xpDecayPercent: number;
  coinDecayPercent: number;
  lootLuckReduction: number;
  contractPenalty: boolean;
  petMoodOverride: PetMoodValue | null;
  cityVibrancy: number;
  appliedAt: string;
  recoveredAt: string | null;
};

export type PunishmentAnalytics = {
  totalApplied: number;
  totalRecovered: number;
  totalWarnings: number;
  streakFailures: number;
  contractFailures: number;
  focusFailures: number;
  inactivityFailures: number;
  avgRecoveryDays: number;
  lastAppliedAt: string | null;
  lastRecoveredAt: string | null;
};

export type AggregatedPenalties = {
  xpDecayPercent: number;
  coinDecayPercent: number;
  lootLuckReduction: number;
  contractPenalty: boolean;
  cityVibrancy: number;
  petMoodOverride: PetMoodValue | null;
  hasActivePenalties: boolean;
};

export type PunishmentRecoveryResult = {
  removedCount: number;
  recoveryDays: number;
  bonusXp: number;
  bonusCoins: number;
  lootBoxChance: boolean;
  allCleared: boolean;
};
