import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';
import { LootBoxRewardType, type LootBoxReward } from '@/types/loot-box';

import { GAME_ITEMS_BY_KEY } from './item-catalog';

type WeightedSpecialDrop = {
  weight: number;
  itemKey: string;
  amount?: number;
};

const special = (weight: number, itemKey: string, amount = 1): WeightedSpecialDrop => ({
  weight,
  itemKey,
  amount,
});

/** Itens especiais por raridade de caixa — pesos relativos dentro do pool SPECIAL. */
export const LOOT_BOX_SPECIAL_DROPS: Record<LootBoxRarityValue, WeightedSpecialDrop[]> = {
  [LootBoxRarity.COMMON]: [
    special(10, 'cafe_expresso'),
    special(8, 'soro_xp_pequeno'),
    special(7, 'bolsa_moedas_pequena'),
    special(6, 'tonico_xp_10_1h'),
    special(5, 'elixir_moedas_10_1h'),
    special(4, 'kit_escudo'),
  ],
  [LootBoxRarity.UNCOMMON]: [
    special(9, 'tonico_xp_10_1h'),
    special(8, 'elixir_moedas_10_1h'),
    special(7, 'soro_xp_pequeno'),
    special(7, 'bolsa_moedas_pequena'),
    special(6, 'sorte_loot_15_1h'),
    special(5, 'tonico_xp_25_30m'),
    special(4, 'kit_escudo'),
  ],
  [LootBoxRarity.RARE]: [
    special(8, 'tonico_xp_25_30m'),
    special(7, 'soro_xp_grande'),
    special(7, 'bolsa_moedas_grande'),
    special(6, 'sorte_loot_15_1h'),
    special(6, 'elixir_moedas_10_1h'),
    special(5, 'foco_profundo_30m'),
    special(4, 'kit_escudo_duplo'),
    special(3, 'bilhete_loot_gratis'),
  ],
  [LootBoxRarity.EPIC]: [
    special(7, 'tonico_xp_50_1h'),
    special(6, 'elixir_xp_dobro_1h'),
    special(6, 'elixir_moedas_dobro_1h'),
    special(5, 'ima_de_sorte_30m'),
    special(5, 'combo_estudo_1h'),
    special(4, 'ampulheta_missoes_1h'),
    special(4, 'bilhete_loot_gratis'),
    special(3, 'chave_prata'),
    special(3, 'booster_study'),
    special(3, 'trait_reroll_single'),
  ],
  [LootBoxRarity.LEGENDARY]: [
    special(6, 'elixir_xp_dobro_1h'),
    special(6, 'elixir_moedas_dobro_1h'),
    special(5, 'tonico_xp_50_1h'),
    special(5, 'legendary_collector'),
    special(4, 'bilhete_streak'),
    special(4, 'golden_ticket'),
    special(3, 'chave_ouro'),
    special(3, 'combo_estudo_1h'),
    special(2, 'trait_reroll_all'),
  ],
  [LootBoxRarity.MYTHIC]: [
    special(5, 'convite_faang'),
    special(5, 'medalha_world_class'),
    special(4, 'chave_lendaria'),
    special(4, 'bilhete_streak'),
    special(4, 'pet_egg'),
    special(3, 'ampulheta_missoes_1h'),
    special(3, 'elixir_xp_dobro_1h'),
  ],
  [LootBoxRarity.ANCIENT]: [
    special(5, 'faang_invitation'),
    special(5, 'world_class_engineer_medal'),
    special(4, 'chave_lendaria'),
    special(4, 'medalha_world_class'),
    special(3, 'convite_faang'),
    special(2, 'bilhete_streak', 2),
  ],
};

export const buildLootBoxSpecialRewards = (
  rarity: LootBoxRarityValue,
  totalSpecialWeight: number,
): Array<{ weight: number; reward: LootBoxReward }> => {
  const drops = LOOT_BOX_SPECIAL_DROPS[rarity];
  if (!drops.length || totalSpecialWeight <= 0) return [];

  const dropWeightSum = drops.reduce((sum, d) => sum + d.weight, 0);

  return drops.map((drop) => {
    const catalogItem = GAME_ITEMS_BY_KEY[drop.itemKey];
    const label = catalogItem?.name ?? drop.itemKey;
    const weight = Math.max(1, Math.round((drop.weight / dropWeightSum) * totalSpecialWeight));

    return {
      weight,
      reward: {
        type: LootBoxRewardType.SPECIAL,
        amount: drop.amount ?? 1,
        itemKey: drop.itemKey,
        label,
      },
    };
  });
};
