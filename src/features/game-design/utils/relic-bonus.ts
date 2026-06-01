import { COLLECTIBLE_BY_KEY } from '@/features/game-design/catalogs/collectible-catalog';
import { GAME_ITEMS_BY_KEY } from '@/features/game-design/catalogs/item-catalog';
import { CollectibleCategory } from '@/types/collectible';

export type RelicBonusBreakdown = {
  xpPercent: number;
  coinPercent: number;
  allRewardsPercent: number;
};

const parsePercent = (text: string | undefined): number | null => {
  if (!text) return null;
  const match = text.match(/\+(\d+(?:\.\d+)?)\s*%/i);
  return match ? Number(match[1]) : null;
};

/** Sum passive bonuses from discovered collection book items (capped externally). */
export const sumRelicBonusesFromKeys = (discoveredKeys: string[]): RelicBonusBreakdown => {
  let xpPercent = 0;
  let coinPercent = 0;
  let allRewardsPercent = 0;

  for (const key of discoveredKeys) {
    const item = COLLECTIBLE_BY_KEY[key];
    if (!item) continue;

    const bonusText = item.passiveBonus ?? '';
    const flat = parsePercent(bonusText);

    if (bonusText.includes('XP') && bonusText.includes('moedas') && flat) {
      xpPercent += flat;
      coinPercent += flat;
      continue;
    }

    if (bonusText.includes('todas recompensas') && flat) {
      allRewardsPercent += flat;
      continue;
    }

    if (bonusText.includes('XP') && flat) {
      xpPercent += flat;
      continue;
    }

    if (bonusText.includes('moedas') && flat) {
      coinPercent += flat;
      continue;
    }

    if (item.category === CollectibleCategory.RELIC && flat) {
      xpPercent += flat;
      coinPercent += flat;
    }
  }

  return { xpPercent, coinPercent, allRewardsPercent };
};

/** Inventory relic items (game item catalog). */
export const sumInventoryRelicBonuses = (itemKeys: string[]): RelicBonusBreakdown => {
  let xpPercent = 0;
  let coinPercent = 0;

  for (const key of itemKeys) {
    const item = GAME_ITEMS_BY_KEY[key];
    if (!item || item.category !== 'relic') continue;
    if (item.effectType === 'passive_xp') xpPercent += item.effectValue;
    if (item.effectType === 'passive_coins') coinPercent += item.effectValue;
  }

  return { xpPercent, coinPercent, allRewardsPercent: 0 };
};
