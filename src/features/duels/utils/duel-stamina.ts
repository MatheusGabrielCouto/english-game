import { DUEL_PROGRESSION_CONFIG } from '../constants/duel-progression-config';

const MS_PER_HOUR = 60 * 60 * 1000;

export const computeStaminaAfterRegen = (
  stamina: number,
  staminaUpdatedAt: string,
  now = new Date(),
): { stamina: number; staminaUpdatedAt: string } => {
  const cap = DUEL_PROGRESSION_CONFIG.maxStamina;
  if (stamina >= cap) {
    return { stamina: cap, staminaUpdatedAt: now.toISOString() };
  }

  const last = new Date(staminaUpdatedAt).getTime();
  const elapsed = Math.max(0, now.getTime() - last);
  const regenTicks = Math.floor(elapsed / (DUEL_PROGRESSION_CONFIG.staminaRegenHours * MS_PER_HOUR));

  if (regenTicks <= 0) {
    return { stamina: Math.max(0, stamina), staminaUpdatedAt };
  }

  const nextStamina = Math.min(cap, stamina + regenTicks);
  return { stamina: nextStamina, staminaUpdatedAt: now.toISOString() };
};

export const getNextStaminaRegenAt = (
  stamina: number,
  staminaUpdatedAt: string,
  now = new Date(),
): Date | null => {
  if (stamina >= DUEL_PROGRESSION_CONFIG.maxStamina) return null;

  const last = new Date(staminaUpdatedAt).getTime();
  const interval = DUEL_PROGRESSION_CONFIG.staminaRegenHours * MS_PER_HOUR;
  const elapsed = Math.max(0, now.getTime() - last);
  const remainder = interval - (elapsed % interval);

  return new Date(now.getTime() + remainder);
};
