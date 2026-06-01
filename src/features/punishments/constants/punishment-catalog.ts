import { PetMood } from '@/types/pet';
import {
  PunishmentSeverity,
  PunishmentTrigger,
  type PunishmentSeverityValue,
  type PunishmentTriggerValue,
} from '@/types/punishment';

export type PenaltyPreset = {
  xpDecayPercent: number;
  coinDecayPercent: number;
  lootLuckReduction: number;
  contractPenalty: boolean;
  petMoodOverride: (typeof PetMood)[keyof typeof PetMood] | null;
  cityVibrancy: number;
  durationHours: number | null;
};

export const PENALTY_PRESETS: Record<PunishmentSeverityValue, PenaltyPreset> = {
  [PunishmentSeverity.LIGHT]: {
    xpDecayPercent: 5,
    coinDecayPercent: 5,
    lootLuckReduction: 3,
    contractPenalty: false,
    petMoodOverride: PetMood.SAD,
    cityVibrancy: 78,
    durationHours: 24,
  },
  [PunishmentSeverity.MEDIUM]: {
    xpDecayPercent: 8,
    coinDecayPercent: 8,
    lootLuckReduction: 5,
    contractPenalty: true,
    petMoodOverride: PetMood.VERY_SAD,
    cityVibrancy: 62,
    durationHours: 72,
  },
};

export const RECOVERY_THRESHOLDS = {
  removeLight: 1,
  removeMedium: 3,
  removeAll: 7,
} as const;

export const RECOVERY_BONUS = {
  light: { xp: 15, coins: 8 },
  medium: { xp: 35, coins: 18 },
  full: { xp: 75, coins: 40, lootBoxRoll: 0.08 },
} as const;

export const MAX_PENALTY_STACK = {
  xpDecayPercent: 20,
  coinDecayPercent: 20,
  lootLuckReduction: 12,
} as const;

export const INACTIVITY_DAYS = {
  light: 2,
  medium: 5,
} as const;

export const TRIGGER_SEVERITY: Record<PunishmentTriggerValue, PunishmentSeverityValue> = {
  [PunishmentTrigger.STREAK_BROKEN]: PunishmentSeverity.LIGHT,
  [PunishmentTrigger.CONTRACT_FAILED]: PunishmentSeverity.MEDIUM,
  [PunishmentTrigger.FOCUS_DISTRACTION]: PunishmentSeverity.LIGHT,
  [PunishmentTrigger.FOCUS_ABANDONED]: PunishmentSeverity.LIGHT,
  [PunishmentTrigger.INACTIVITY]: PunishmentSeverity.LIGHT,
};
