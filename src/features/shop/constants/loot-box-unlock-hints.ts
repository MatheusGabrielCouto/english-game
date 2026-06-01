import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';

export const LOOT_BOX_UNLOCK_HINTS: Record<LootBoxRarityValue, string> = {
  [LootBoxRarity.COMMON]: '',
  [LootBoxRarity.UNCOMMON]:
    'Não vendida por moedas. Obtenha via Study Points (Collection Book), milestone de nível 10+ ou bônus semanal.',
  [LootBoxRarity.RARE]: '',
  [LootBoxRarity.EPIC]: '',
  [LootBoxRarity.LEGENDARY]:
    'Não vendida por moedas. Alcance Prestígio II, nível 100, conquistas ou faça upgrade com Study Points.',
  [LootBoxRarity.MYTHIC]:
    'Não vendida por moedas. Alcance Prestígio III+ ou faça upgrade Lendária → Mítica no Collection Book.',
  [LootBoxRarity.ANCIENT]:
    'Não vendida por moedas. Alcance Prestígio V ou faça upgrade Mítica → Ancestral (2500 SP).',
};
