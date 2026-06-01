import {
  resolveGameItem,
  type GameItemDefinition,
  type ItemEffectType,
} from '@/features/game-design/catalogs/item-catalog';
import { ActiveBoosterRepository, type ActiveBoosterRecord } from '@/storage/repositories/active-booster-repository';

export type ActiveBoosterDisplay = {
  boosterKey: string;
  name: string;
  icon: string;
  expiresAt: string;
  xpPercent: number;
  coinPercent: number;
  lootLuckPercent: number;
  contractRewardPercent: number;
};

export type BoosterBonusTotals = {
  xpPercent: number;
  coinPercent: number;
  lootLuckPercent: number;
  contractRewardPercent: number;
  active: ActiveBoosterDisplay[];
};

const EMPTY: BoosterBonusTotals = {
  xpPercent: 0,
  coinPercent: 0,
  lootLuckPercent: 0,
  contractRewardPercent: 0,
  active: [],
};

let cached: BoosterBonusTotals = EMPTY;

const percentFromItem = (def: GameItemDefinition): {
  xp: number;
  coins: number;
  loot: number;
  contract: number;
} => {
  const value = def.effectValue;
  const secondary = def.secondaryValue ?? 0;

  switch (def.effectType as ItemEffectType) {
    case 'double_xp':
      return { xp: 100, coins: 0, loot: 0, contract: 0 };
    case 'double_coins':
      return { xp: 0, coins: 100, loot: 0, contract: 0 };
    case 'timed_xp_percent':
      if (def.key === 'combo_estudo_1h') {
        return { xp: value, coins: secondary, loot: secondary, contract: 0 };
      }
      return { xp: value, coins: 0, loot: 0, contract: 0 };
    case 'timed_coin_percent':
      return { xp: 0, coins: value, loot: 0, contract: 0 };
    case 'timed_loot_luck':
      return { xp: 0, coins: 0, loot: value, contract: 0 };
    case 'timed_contract_percent':
    case 'quest_multiplier':
      return { xp: 0, coins: 0, loot: 0, contract: value };
    default:
      return { xp: 0, coins: 0, loot: 0, contract: 0 };
  }
};

const resolveBoosterDefinition = (boosterKey: string) => {
  const direct = resolveGameItem(boosterKey);
  if (direct) return direct;

  const baseKey = boosterKey.replace(/_(xp|coins|loot|contract)$/, '');
  return resolveGameItem(baseKey);
};

const rowToBonus = (row: ActiveBoosterRecord) => {
  if (row.boosterKey.endsWith('_xp')) {
    return { xp: row.multiplier, coins: 0, loot: 0, contract: 0 };
  }
  if (row.boosterKey.endsWith('_coins')) {
    return { xp: 0, coins: row.multiplier, loot: 0, contract: 0 };
  }
  if (row.boosterKey.endsWith('_loot')) {
    return { xp: 0, coins: 0, loot: row.multiplier, contract: 0 };
  }
  if (row.boosterKey.endsWith('_contract')) {
    return { xp: 0, coins: 0, loot: 0, contract: row.multiplier };
  }

  const def = resolveBoosterDefinition(row.boosterKey);
  if (def) return percentFromItem(def);

  return { xp: 0, coins: 0, loot: 0, contract: 0 };
};

export const BoosterModifierCache = {
  getSync(): BoosterBonusTotals {
    return cached;
  },

  async refresh(): Promise<BoosterBonusTotals> {
    await ActiveBoosterRepository.deleteExpired();
    const rows = await ActiveBoosterRepository.findActive();

    let xpPercent = 0;
    let coinPercent = 0;
    let lootLuckPercent = 0;
    let contractRewardPercent = 0;
    const active: ActiveBoosterDisplay[] = [];

    for (const row of rows) {
      const bonus = rowToBonus(row);
      xpPercent += bonus.xp;
      coinPercent += bonus.coins;
      lootLuckPercent += bonus.loot;
      contractRewardPercent += bonus.contract;

      const def = resolveBoosterDefinition(row.boosterKey);
      active.push({
        boosterKey: row.boosterKey,
        name: def?.name ?? row.boosterKey,
        icon: def?.icon ?? '✨',
        expiresAt: row.expiresAt,
        xpPercent: bonus.xp,
        coinPercent: bonus.coins,
        lootLuckPercent: bonus.loot,
        contractRewardPercent: bonus.contract,
      });
    }

    cached = { xpPercent, coinPercent, lootLuckPercent, contractRewardPercent, active };
    return cached;
  },

  reset(): void {
    cached = EMPTY;
  },
};
