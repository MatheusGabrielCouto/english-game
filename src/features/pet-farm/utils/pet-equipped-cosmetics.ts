import type { PetEquippedCosmetics, PetCosmeticSlot } from '@/types/pet-expansion';

const SLOTS: PetCosmeticSlot[] = ['hat', 'glasses', 'backpack', 'outfit', 'skin'];

export const parseEquippedCosmeticsJson = (json: string | null | undefined): PetEquippedCosmetics => {
  if (!json) return {};
  try {
    const parsed = JSON.parse(json) as unknown;
    if (!parsed || typeof parsed !== 'object') return {};
    const result: PetEquippedCosmetics = {};
    for (const slot of SLOTS) {
      const value = (parsed as Record<string, unknown>)[slot];
      if (typeof value === 'string' && value.length > 0) {
        result[slot] = value;
      }
    }
    return result;
  } catch {
    return {};
  }
};

export const serializeEquippedCosmetics = (equipped: PetEquippedCosmetics): string =>
  JSON.stringify(equipped);
