import { LootBoxRarity } from '@/types/inventory';

import type { FocusDurationMinutes } from './focus-config';

export type FocusTierRewards = {
  baseXp: number;
  baseCoins: number;
  tierLabel: string;
};

export const FOCUS_TIER_BY_DURATION: Record<FocusDurationMinutes, FocusTierRewards> = {
  15: { baseXp: 25, baseCoins: 12, tierLabel: 'Básica' },
  30: { baseXp: 55, baseCoins: 28, tierLabel: 'Média' },
  60: { baseXp: 120, baseCoins: 60, tierLabel: 'Bônus' },
  90: { baseXp: 200, baseCoins: 100, tierLabel: 'Alta' },
};

export const rollFocusLootRarity = (durationMinutes: FocusDurationMinutes): string | null => {
  const roll = Math.random();
  if (durationMinutes >= 90 && roll < 0.18) return LootBoxRarity.RARE;
  if (durationMinutes >= 60 && roll < 0.1) return LootBoxRarity.UNCOMMON;
  if (durationMinutes >= 30 && roll < 0.05) return LootBoxRarity.COMMON;
  if (durationMinutes >= 15 && roll < 0.02) return LootBoxRarity.COMMON;
  return null;
};
