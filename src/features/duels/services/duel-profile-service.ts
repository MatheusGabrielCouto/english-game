import type { DuelPatent, DuelPlayerProfileRecord } from '@/types/duel';
import { DUEL_PROFILE_ROW_ID } from '@/types/duel';

import { getTodayKey } from '@/features/quests/utils/date';
import { DuelRepository } from '@/storage/repositories/duel-repository';

import { DUEL_PROGRESSION_CONFIG } from '../constants/duel-progression-config';
import { DuelPatentService } from './duel-patent-service';
import { computeStaminaAfterRegen, getNextStaminaRegenAt } from '../utils/duel-stamina';

export type DuelProfileView = DuelPlayerProfileRecord & {
  staminaCap: number;
  canStartRanked: boolean;
  nextStaminaRegenAt: string | null;
};

const clampStamina = (value: number): number =>
  Math.min(DUEL_PROGRESSION_CONFIG.maxStamina, Math.max(0, value));

export const DuelProfileService = {
  async reconcileProfile(): Promise<DuelProfileView> {
    const existing = await DuelRepository.getProfile();
    const now = new Date();
    const today = getTodayKey();

    const base: DuelPlayerProfileRecord = existing ?? {
      id: DUEL_PROFILE_ROW_ID,
      currentPatent: 'tourist',
      patentXp: 0,
      highestPatent: 'tourist',
      stamina: DUEL_PROGRESSION_CONFIG.maxStamina,
      staminaUpdatedAt: now.toISOString(),
      focusCharges: 1,
      dailyDuelCount: 0,
      dailyResetDate: today,
    };

    let profile: DuelPlayerProfileRecord = { ...base };

    if (profile.dailyResetDate !== today) {
      profile = {
        ...profile,
        dailyDuelCount: 0,
        dailyResetDate: today,
      };
    }

    const regen = computeStaminaAfterRegen(profile.stamina, profile.staminaUpdatedAt, now);
    profile = {
      ...profile,
      stamina: clampStamina(regen.stamina),
      staminaUpdatedAt: regen.staminaUpdatedAt,
    };

    await DuelRepository.updateProfile(profile);

    const nextRegen = getNextStaminaRegenAt(profile.stamina, profile.staminaUpdatedAt, now);

    return {
      ...profile,
      staminaCap: DUEL_PROGRESSION_CONFIG.maxStamina,
      canStartRanked:
        profile.stamina > 0 &&
        profile.dailyDuelCount < DUEL_PROGRESSION_CONFIG.dailyRankedCap,
      nextStaminaRegenAt: nextRegen?.toISOString() ?? null,
    };
  },

  async consumeRankedStamina(): Promise<DuelProfileView> {
    const profile = await DuelProfileService.reconcileProfile();

    if (!profile.canStartRanked) {
      throw new Error('Sem stamina para duelo ranqueado');
    }

    const updated: DuelPlayerProfileRecord = {
      ...profile,
      stamina: clampStamina(profile.stamina - 1),
      staminaUpdatedAt: new Date().toISOString(),
      dailyDuelCount: profile.dailyDuelCount + 1,
    };

    await DuelRepository.updateProfile(updated);

    return DuelProfileService.reconcileProfile();
  },

  async promotePatent(target: DuelPatent): Promise<DuelProfileView> {
    const profile = await DuelProfileService.reconcileProfile();

    if (!DuelPatentService.canPromoteTo(profile.currentPatent, target)) {
      throw new Error('Patente inválida para promoção');
    }

    const updated: DuelPlayerProfileRecord = {
      ...profile,
      currentPatent: target,
      highestPatent: DuelPatentService.resolveHighestPatent(profile.highestPatent, target),
      patentXp: profile.patentXp + 100,
    };

    await DuelRepository.updateProfile(updated);
    return DuelProfileService.reconcileProfile();
  },

  /** Derrota nunca rebaixa patente — noop explícito para auditoria. */
  async onDuelDefeat(): Promise<DuelProfileView> {
    return DuelProfileService.reconcileProfile();
  },

  async grantBonusStamina(amount: number): Promise<DuelProfileView> {
    const profile = await DuelProfileService.reconcileProfile();
    const updated: DuelPlayerProfileRecord = {
      ...profile,
      stamina: clampStamina(profile.stamina + amount),
      staminaUpdatedAt: new Date().toISOString(),
    };
    await DuelRepository.updateProfile(updated);
    return DuelProfileService.reconcileProfile();
  },
};
