import { LootBoxRarity } from '@/types/inventory';
import type { SeasonTier } from '@/types/metagame';

export type SeasonRewardType =
  | 'coins'
  | 'loot_box'
  | 'shield'
  | 'title'
  | 'special_item';

export type SeasonTierReward = {
  type: SeasonRewardType;
  amount?: number;
  rarity?: (typeof LootBoxRarity)[keyof typeof LootBoxRarity];
  titleKey?: string;
  itemKey?: string;
};

export type SeasonPointSource = {
  key: string;
  label: string;
  points: number;
  emoji: string;
};

export const SEASON_POINT_SOURCES: SeasonPointSource[] = [
  { key: 'daily', label: 'Missão diária concluída', points: 10, emoji: '✅' },
  { key: 'weekly', label: 'Missão semanal resgatada', points: 50, emoji: '📅' },
  { key: 'study', label: 'Dia de estudo registrado', points: 15, emoji: '📚' },
  { key: 'focus', label: 'Sessão de foco completa', points: 12, emoji: '🎯' },
  { key: 'contract', label: 'Contrato concluído', points: 25, emoji: '📋' },
  { key: 'achievement', label: 'Conquista desbloqueada', points: 30, emoji: '🏆' },
];

export const SEASON_TIER_REWARDS: Record<number, SeasonTierReward[]> = {
  1: [{ type: 'coins', amount: 50 }],
  2: [{ type: 'loot_box', rarity: LootBoxRarity.RARE }],
  3: [
    { type: 'coins', amount: 100 },
    { type: 'shield', amount: 1 },
  ],
  4: [{ type: 'title', titleKey: 'season_scholar' }],
  5: [
    { type: 'special_item', itemKey: 'combo_estudo_1h', amount: 1 },
    { type: 'loot_box', rarity: LootBoxRarity.EPIC },
  ],
};

export const SEASON_PASS_TIERS: SeasonTier[] = [
  { tier: 1, pointsRequired: 50, rewardLabel: '50 moedas' },
  { tier: 2, pointsRequired: 150, rewardLabel: 'Loot box rara' },
  { tier: 3, pointsRequired: 300, rewardLabel: '100 moedas + 1 escudo' },
  { tier: 4, pointsRequired: 500, rewardLabel: 'Título Estudante Sazonal' },
  { tier: 5, pointsRequired: 800, rewardLabel: 'Combo do Estudante + loot épica' },
];
