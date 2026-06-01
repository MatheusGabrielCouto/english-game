import { PET_INTERACTION_COOLDOWN_MS } from '../constants';

export type PetInteractionCooldown = {
  canInteract: boolean;
  remainingMs: number;
  nextAvailableAt: Date | null;
};

export const getInteractionCooldown = (
  lastInteractionAt: string | null,
  nowMs = Date.now(),
): PetInteractionCooldown => {
  if (!lastInteractionAt) {
    return { canInteract: true, remainingMs: 0, nextAvailableAt: null };
  }

  const lastMs = new Date(lastInteractionAt).getTime();
  const elapsed = nowMs - lastMs;
  const remainingMs = Math.max(0, PET_INTERACTION_COOLDOWN_MS - elapsed);

  return {
    canInteract: remainingMs === 0,
    remainingMs,
    nextAvailableAt: remainingMs > 0 ? new Date(lastMs + PET_INTERACTION_COOLDOWN_MS) : null,
  };
};

export const formatInteractionCooldown = (remainingMs: number): string => {
  if (remainingMs <= 0) return '';

  const totalMinutes = Math.ceil(remainingMs / 60_000);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  return `${totalMinutes}min`;
};
