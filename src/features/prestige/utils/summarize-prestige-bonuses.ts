import { getAccumulatedPrestigeBonuses } from '@/features/prestige/constants/prestige-catalog';
import type { PrestigePermanentBonus } from '@/types/prestige';

const parseBonusValue = (value: string): { amount: number; isPercent: boolean } => {
  const percentMatch = value.match(/\+(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return { amount: Number(percentMatch[1]), isPercent: true };
  }

  const flatMatch = value.match(/\+(\d+)/);
  if (flatMatch) {
    return { amount: Number(flatMatch[1]), isPercent: false };
  }

  return { amount: 0, isPercent: false };
};

const formatBonusValue = (amount: number, isPercent: boolean): string =>
  isPercent ? `+${amount}%` : `+${amount}`;

/** Aggregates duplicate bonus labels from stacked prestige tiers. */
export const summarizePrestigeBonuses = (prestigeLevel: number): PrestigePermanentBonus[] => {
  const raw = getAccumulatedPrestigeBonuses(prestigeLevel);
  const totals = new Map<string, { amount: number; isPercent: boolean }>();

  for (const bonus of raw) {
    const parsed = parseBonusValue(bonus.value);
    const current = totals.get(bonus.label);
    if (!current) {
      totals.set(bonus.label, parsed);
      continue;
    }
    totals.set(bonus.label, {
      amount: current.amount + parsed.amount,
      isPercent: current.isPercent || parsed.isPercent,
    });
  }

  return [...totals.entries()].map(([label, { amount, isPercent }]) => ({
    label,
    value: formatBonusValue(amount, isPercent),
  }));
};
