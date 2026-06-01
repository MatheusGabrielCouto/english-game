import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';

export type LootBoxCatalogCategory = {
  key: string;
  label: string;
  emoji: string;
};

export type LootBoxCatalogMeta = {
  rarity: LootBoxRarityValue;
  title: string;
  emoji: string;
  description: string;
  highlightCategories: LootBoxCatalogCategory[];
};

export const LOOT_BOX_CATALOG_ORDER: LootBoxRarityValue[] = [
  LootBoxRarity.COMMON,
  LootBoxRarity.UNCOMMON,
  LootBoxRarity.RARE,
  LootBoxRarity.EPIC,
  LootBoxRarity.LEGENDARY,
  LootBoxRarity.MYTHIC,
  LootBoxRarity.ANCIENT,
];

export const LOOT_BOX_CATALOG_META: Record<LootBoxRarityValue, LootBoxCatalogMeta> = {
  [LootBoxRarity.COMMON]: {
    rarity: LootBoxRarity.COMMON,
    title: 'Common Box',
    emoji: '📦',
    description: 'Entrada ideal — moedas, escudos e colecionáveis comuns.',
    highlightCategories: [
      { key: 'coins', label: 'Moedas', emoji: '🪙' },
      { key: 'shields', label: 'Escudos', emoji: '🛡️' },
      { key: 'collectibles', label: 'Colecionáveis', emoji: '✨' },
    ],
  },
  [LootBoxRarity.UNCOMMON]: {
    rarity: LootBoxRarity.UNCOMMON,
    title: 'Uncommon Box',
    emoji: '🎁',
    description: 'Melhores chances de upgrade e colecionáveis incomuns.',
    highlightCategories: [
      { key: 'coins', label: 'Moedas', emoji: '🪙' },
      { key: 'study_points', label: 'Study Points', emoji: '⚡' },
      { key: 'collectibles', label: 'Colecionáveis', emoji: '✨' },
    ],
  },
  [LootBoxRarity.RARE]: {
    rarity: LootBoxRarity.RARE,
    title: 'Rare Box',
    emoji: '💎',
    description: 'Relíquias, consumíveis, tickets e pets raros.',
    highlightCategories: [
      { key: 'relics', label: 'Relíquias', emoji: '📕' },
      { key: 'consumables', label: 'Consumíveis', emoji: '🧪' },
      { key: 'tickets', label: 'Tickets', emoji: '🎫' },
      { key: 'pets', label: 'Pets', emoji: '🐾' },
    ],
  },
  [LootBoxRarity.EPIC]: {
    rarity: LootBoxRarity.EPIC,
    title: 'Epic Box',
    emoji: '🔮',
    description: 'Relíquias raras, pets raros e cosméticos épicos.',
    highlightCategories: [
      { key: 'relics', label: 'Relíquias raras', emoji: '📕' },
      { key: 'pets', label: 'Pets raros', emoji: '🐉' },
      { key: 'cosmetics', label: 'Cosméticos', emoji: '🎨' },
    ],
  },
  [LootBoxRarity.LEGENDARY]: {
    rarity: LootBoxRarity.LEGENDARY,
    title: 'Legendary Box',
    emoji: '👑',
    description: 'Itens lendários, pets lendários e relíquias lendárias.',
    highlightCategories: [
      { key: 'legendary', label: 'Lendários', emoji: '👑' },
      { key: 'pets', label: 'Pets lendários', emoji: '🦄' },
      { key: 'relics', label: 'Relíquias lendárias', emoji: '💎' },
    ],
  },
  [LootBoxRarity.MYTHIC]: {
    rarity: LootBoxRarity.MYTHIC,
    title: 'Mythic Box',
    emoji: '✨',
    description: 'Itens únicos, cosméticos únicos e títulos exclusivos.',
    highlightCategories: [
      { key: 'mythic', label: 'Míticos', emoji: '⚔️' },
      { key: 'cosmetics', label: 'Cosméticos únicos', emoji: '🖼️' },
      { key: 'titles', label: 'Títulos exclusivos', emoji: '🏅' },
    ],
  },
  [LootBoxRarity.ANCIENT]: {
    rarity: LootBoxRarity.ANCIENT,
    title: 'Ancient Box',
    emoji: '🔥',
    description: 'Endgame — FAANG Invitation, World Class Medal e ultra raros.',
    highlightCategories: [
      { key: 'ultra_rare', label: 'Ultra raros', emoji: '🌟' },
      { key: 'endgame', label: 'Endgame', emoji: '🏆' },
      { key: 'ancient', label: 'Ancestrais', emoji: '🔥' },
    ],
  },
};
