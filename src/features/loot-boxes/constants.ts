import { buildLootBoxSpecialRewards } from '@/features/game-design/catalogs/loot-box-special-pools';
import { LOOT_BOX_RARITY_CONFIG } from '@/features/inventory/constants';
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';
import { LootBoxRewardType, type LootBoxReward } from '@/types/loot-box';

type WeightedReward = {
  weight: number;
  reward: LootBoxReward;
};

const w = (weight: number, reward: LootBoxReward): WeightedReward => ({ weight, reward });

const boxUpgrade = (_from: LootBoxRarityValue, to: LootBoxRarityValue, weight: number) => {
  const target = LOOT_BOX_RARITY_CONFIG[to];
  return w(weight, {
    type: LootBoxRewardType.LOOT_BOX,
    amount: 1,
    rarity: to,
    label: `Upgrade → ${target.emoji} ${target.label}`,
  });
};

const collectible = (weight: number) =>
  w(weight, {
    type: LootBoxRewardType.COLLECTIBLE,
    amount: 1,
    label: 'Colecionável descoberto!',
  });

const studyPoints = (amount: number, weight: number) =>
  w(weight, {
    type: LootBoxRewardType.STUDY_POINTS,
    amount,
    label: `${amount} Study Points`,
  });

const SPECIAL_WEIGHT: Record<LootBoxRarityValue, number> = {
  [LootBoxRarity.COMMON]: 14,
  [LootBoxRarity.UNCOMMON]: 16,
  [LootBoxRarity.RARE]: 18,
  [LootBoxRarity.EPIC]: 22,
  [LootBoxRarity.LEGENDARY]: 24,
  [LootBoxRarity.MYTHIC]: 26,
  [LootBoxRarity.ANCIENT]: 22,
};

const basePools: Record<LootBoxRarityValue, WeightedReward[]> = {
  [LootBoxRarity.COMMON]: [
    w(32, { type: LootBoxRewardType.COINS, amount: 25, label: '25 moedas' }),
    w(22, { type: LootBoxRewardType.COINS, amount: 50, label: '50 moedas' }),
    w(12, { type: LootBoxRewardType.SHIELD, amount: 1, label: '1 escudo' }),
    studyPoints(15, 8),
    collectible(6),
    boxUpgrade(LootBoxRarity.COMMON, LootBoxRarity.UNCOMMON, 6),
  ],
  [LootBoxRarity.UNCOMMON]: [
    w(28, { type: LootBoxRewardType.COINS, amount: 60, label: '60 moedas' }),
    w(18, { type: LootBoxRewardType.COINS, amount: 90, label: '90 moedas' }),
    w(12, { type: LootBoxRewardType.SHIELD, amount: 1, label: '1 escudo' }),
    studyPoints(30, 10),
    collectible(10),
    boxUpgrade(LootBoxRarity.UNCOMMON, LootBoxRarity.RARE, 8),
  ],
  [LootBoxRarity.RARE]: [
    w(24, { type: LootBoxRewardType.COINS, amount: 100, label: '100 moedas' }),
    w(18, { type: LootBoxRewardType.COINS, amount: 150, label: '150 moedas' }),
    w(12, { type: LootBoxRewardType.SHIELD, amount: 2, label: '2 escudos' }),
    studyPoints(50, 8),
    collectible(14),
    boxUpgrade(LootBoxRarity.RARE, LootBoxRarity.EPIC, 10),
  ],
  [LootBoxRarity.EPIC]: [
    w(20, { type: LootBoxRewardType.COINS, amount: 200, label: '200 moedas' }),
    w(16, { type: LootBoxRewardType.COINS, amount: 300, label: '300 moedas' }),
    w(10, { type: LootBoxRewardType.SHIELD, amount: 2, label: '2 escudos' }),
    studyPoints(80, 8),
    collectible(16),
    boxUpgrade(LootBoxRarity.EPIC, LootBoxRarity.LEGENDARY, 6),
  ],
  [LootBoxRarity.LEGENDARY]: [
    w(16, { type: LootBoxRewardType.COINS, amount: 400, label: '400 moedas' }),
    w(14, { type: LootBoxRewardType.COINS, amount: 600, label: '600 moedas' }),
    w(10, { type: LootBoxRewardType.SHIELD, amount: 3, label: '3 escudos' }),
    studyPoints(120, 8),
    collectible(22),
    boxUpgrade(LootBoxRarity.LEGENDARY, LootBoxRarity.MYTHIC, 6),
  ],
  [LootBoxRarity.MYTHIC]: [
    w(14, { type: LootBoxRewardType.COINS, amount: 800, label: '800 moedas' }),
    w(10, { type: LootBoxRewardType.COINS, amount: 1200, label: '1200 moedas' }),
    studyPoints(200, 12),
    collectible(28),
    boxUpgrade(LootBoxRarity.MYTHIC, LootBoxRarity.ANCIENT, 8),
  ],
  [LootBoxRarity.ANCIENT]: [
    w(12, { type: LootBoxRewardType.COINS, amount: 1500, label: '1500 moedas' }),
    w(10, { type: LootBoxRewardType.COINS, amount: 2500, label: '2500 moedas' }),
    studyPoints(350, 12),
    collectible(36),
  ],
};

const withSpecialDrops = (rarity: LootBoxRarityValue): WeightedReward[] => {
  const base = basePools[rarity];
  const specialWeight = SPECIAL_WEIGHT[rarity];
  const specials = buildLootBoxSpecialRewards(rarity, specialWeight);
  return [...base, ...specials];
};

export const LOOT_BOX_REWARD_POOLS: Record<LootBoxRarityValue, WeightedReward[]> = {
  [LootBoxRarity.COMMON]: withSpecialDrops(LootBoxRarity.COMMON),
  [LootBoxRarity.UNCOMMON]: withSpecialDrops(LootBoxRarity.UNCOMMON),
  [LootBoxRarity.RARE]: withSpecialDrops(LootBoxRarity.RARE),
  [LootBoxRarity.EPIC]: withSpecialDrops(LootBoxRarity.EPIC),
  [LootBoxRarity.LEGENDARY]: withSpecialDrops(LootBoxRarity.LEGENDARY),
  [LootBoxRarity.MYTHIC]: withSpecialDrops(LootBoxRarity.MYTHIC),
  [LootBoxRarity.ANCIENT]: withSpecialDrops(LootBoxRarity.ANCIENT),
};

export const LOOT_BOX_MESSAGES = {
  opened: 'Loot Box aberta!',
  empty: 'Nenhuma loot box disponível para abrir.',
  confirmOpen: 'Deseja abrir esta loot box?',
} as const;

export const LOOT_BOX_RARITY_COLORS: Record<LootBoxRarityValue, string> = {
  [LootBoxRarity.COMMON]: '#94a3b8',
  [LootBoxRarity.UNCOMMON]: '#22c55e',
  [LootBoxRarity.RARE]: '#3b82f6',
  [LootBoxRarity.EPIC]: '#a855f7',
  [LootBoxRarity.LEGENDARY]: '#fbbf24',
  [LootBoxRarity.MYTHIC]: '#f472b6',
  [LootBoxRarity.ANCIENT]: '#ef4444',
};

export const LOOT_BOX_RARITY_LABELS: Record<LootBoxRarityValue, string> = {
  [LootBoxRarity.COMMON]: 'Comum',
  [LootBoxRarity.UNCOMMON]: 'Incomum',
  [LootBoxRarity.RARE]: 'Rara',
  [LootBoxRarity.EPIC]: 'Épica',
  [LootBoxRarity.LEGENDARY]: 'Lendária',
  [LootBoxRarity.MYTHIC]: 'Mítica',
  [LootBoxRarity.ANCIENT]: 'Ancestral',
};
