import type {
  ActivePenalty,
  AggregatedPenalties,
  PunishmentSeverityValue,
  PunishmentState,
} from '@/types/punishment';
import { PunishmentSeverity } from '@/types/punishment';
import { MAX_PENALTY_STACK } from '@/features/punishments/constants/punishment-catalog';
import { PetMood, type PetMoodValue } from '@/types/pet';

const MOOD_RANK: Record<PetMoodValue, number> = {
  [PetMood.VERY_SAD]: 0,
  [PetMood.SAD]: 1,
  [PetMood.NORMAL]: 2,
  [PetMood.HAPPY]: 3,
  [PetMood.VERY_HAPPY]: 4,
};

export const filterExpiredPenalties = (penalties: ActivePenalty[], now = Date.now()): ActivePenalty[] =>
  penalties.filter((penalty) => {
    if (!penalty.expiresAt) return true;
    return new Date(penalty.expiresAt).getTime() > now;
  });

export const aggregatePenalties = (penalties: ActivePenalty[]): AggregatedPenalties => {
  const active = filterExpiredPenalties(penalties);

  if (active.length === 0) {
    return {
      xpDecayPercent: 0,
      coinDecayPercent: 0,
      lootLuckReduction: 0,
      contractPenalty: false,
      cityVibrancy: 100,
      petMoodOverride: null,
      hasActivePenalties: false,
    };
  }

  const xpDecayPercent = Math.min(
    MAX_PENALTY_STACK.xpDecayPercent,
    active.reduce((sum, penalty) => sum + penalty.xpDecayPercent, 0),
  );
  const coinDecayPercent = Math.min(
    MAX_PENALTY_STACK.coinDecayPercent,
    active.reduce((sum, penalty) => sum + penalty.coinDecayPercent, 0),
  );
  const lootLuckReduction = Math.min(
    MAX_PENALTY_STACK.lootLuckReduction,
    active.reduce((sum, penalty) => sum + penalty.lootLuckReduction, 0),
  );
  const contractPenalty = active.some((penalty) => penalty.contractPenalty);
  const cityVibrancy = Math.min(...active.map((penalty) => penalty.cityVibrancy));

  let petMoodOverride: PetMoodValue | null = null;
  for (const penalty of active) {
    if (!penalty.petMoodOverride) continue;
    if (!petMoodOverride || MOOD_RANK[penalty.petMoodOverride] < MOOD_RANK[petMoodOverride]) {
      petMoodOverride = penalty.petMoodOverride;
    }
  }

  return {
    xpDecayPercent,
    coinDecayPercent,
    lootLuckReduction,
    contractPenalty,
    cityVibrancy,
    petMoodOverride,
    hasActivePenalties: true,
  };
};

export const computeCityVibrancy = (penalties: ActivePenalty[]): number =>
  aggregatePenalties(penalties).cityVibrancy;

export const removePenaltiesBySeverity = (
  penalties: ActivePenalty[],
  severities: PunishmentSeverityValue[],
): { remaining: ActivePenalty[]; removed: ActivePenalty[] } => {
  const remaining: ActivePenalty[] = [];
  const removed: ActivePenalty[] = [];

  for (const penalty of penalties) {
    if (severities.includes(penalty.severity)) {
      removed.push(penalty);
    } else {
      remaining.push(penalty);
    }
  }

  return { remaining, removed };
};

export const syncStateDerivedFields = (state: PunishmentState): PunishmentState => {
  const activePenalties = filterExpiredPenalties(state.activePenalties);
  return {
    ...state,
    activePenalties,
    cityVibrancy: computeCityVibrancy(activePenalties),
    updatedAt: new Date().toISOString(),
  };
};
