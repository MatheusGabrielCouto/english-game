import { LOOT_BOX_LABELS } from '@/features/game-design/catalogs/loot-economy';
import {
    LOOT_BOX_CATALOG_META,
    LOOT_BOX_CATALOG_ORDER,
} from '@/features/loot-boxes/constants/loot-box-catalog-meta';
import { LootBoxRarity, type LootBoxRarityValue } from '@/types/inventory';
import {
    ShopCategory,
    ShopProductRewardType,
    type ShopCategoryValue,
    type ShopProduct,
} from '@/types/shop';

import { LOOT_BOX_UNLOCK_HINTS } from './loot-box-unlock-hints';

export const SHOP_MESSAGES = {
  purchaseCompleted: 'Compra concluída.',
  itemReceived: 'Item adicionado ao seu inventário.',
  insufficientCoins: 'Moedas insuficientes.',
  purchaseCanceled: 'Compra cancelada.',
  unavailable: 'Este item não está disponível no momento.',
} as const;

export const CATEGORY_LABELS: Record<ShopCategoryValue, string> = {
  [ShopCategory.SHIELDS]: 'Escudos',
  [ShopCategory.LOOT_BOXES]: 'Loot Boxes',
  [ShopCategory.PETS]: 'Pets',
  [ShopCategory.SPECIAL]: 'Itens Especiais',
};

export const SHOP_CATEGORY_META: Partial<
  Record<ShopCategoryValue, { emoji: string; title: string; subtitle: string }>
> = {
  [ShopCategory.SHIELDS]: {
    emoji: '🛡️',
    title: 'Escudos',
    subtitle: 'Proteja sua streak nos dias perdidos',
  },
  [ShopCategory.LOOT_BOXES]: {
    emoji: '📦',
    title: 'Loot Boxes',
    subtitle: '4 raridades compráveis com moedas — demais via progressão',
  },
  [ShopCategory.SPECIAL]: {
    emoji: '✨',
    title: 'Itens Especiais',
    subtitle: 'Tickets, boosters e consumíveis úteis no dia a dia',
  },
};

const LOOT_BOX_COIN_PRICES: Partial<Record<LootBoxRarityValue, number>> = {
  [LootBoxRarity.COMMON]: 150,
  [LootBoxRarity.UNCOMMON]: 280,
  [LootBoxRarity.RARE]: 500,
  [LootBoxRarity.EPIC]: 1500,
};

const buildLootBoxProducts = (): ShopProduct[] =>
  LOOT_BOX_CATALOG_ORDER.map((rarity) => {
    const meta = LOOT_BOX_CATALOG_META[rarity];
    const coinPrice = LOOT_BOX_COIN_PRICES[rarity];
    const purchasable = coinPrice != null;

    return {
      key: `loot_box_${rarity}`,
      name: `Loot Box ${LOOT_BOX_LABELS[rarity]}`,
      description: meta.description,
      category: ShopCategory.LOOT_BOXES,
      price: coinPrice ?? 0,
      icon: meta.emoji,
      reward: { type: ShopProductRewardType.LOOT_BOX, rarity, quantity: 1 },
      available: purchasable,
      unlockHint: purchasable ? undefined : LOOT_BOX_UNLOCK_HINTS[rarity],
    };
  });

/** Only categories with at least one implemented product. */
export const SHOP_CATEGORY_ORDER: ShopCategoryValue[] = [
  ShopCategory.SHIELDS,
  ShopCategory.LOOT_BOXES,
  ShopCategory.SPECIAL,
];

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    key: 'shield_1',
    name: 'Escudo',
    description: 'Protege sua sequência por 1 dia perdido.',
    category: ShopCategory.SHIELDS,
    price: 100,
    icon: '🛡️',
    reward: { type: ShopProductRewardType.SHIELD, quantity: 1 },
    available: true,
  },
  {
    key: 'shield_pack',
    name: 'Pack de Escudos',
    description: 'Pacote com 3 escudos — melhor custo por unidade.',
    category: ShopCategory.SHIELDS,
    price: 250,
    icon: '🛡️',
    reward: { type: ShopProductRewardType.SHIELD, quantity: 3 },
    available: true,
  },
  {
    key: 'shield_duo',
    name: 'Duo de Escudos',
    description: 'Par de escudos com leve desconto em relação ao preço avulso.',
    category: ShopCategory.SHIELDS,
    price: 180,
    icon: '🛡️',
    reward: { type: ShopProductRewardType.SHIELD, quantity: 2 },
    available: true,
  },
  {
    key: 'shield_mega_pack',
    name: 'Mega Pack de Escudos',
    description: '5 escudos para quem quer segurança de sobra na streak.',
    category: ShopCategory.SHIELDS,
    price: 400,
    icon: '🛡️',
    reward: { type: ShopProductRewardType.SHIELD, quantity: 5 },
    available: true,
  },
  ...buildLootBoxProducts(),
  {
    key: 'golden_ticket_coin',
    name: 'Ticket Dourado',
    description: 'Abre uma loot box Comum grátis quando quiser.',
    category: ShopCategory.SPECIAL,
    price: 420,
    icon: '🎫',
    reward: { type: ShopProductRewardType.SPECIAL_ITEM, itemKey: 'golden_ticket', quantity: 1 },
    available: true,
  },
  {
    key: 'free_loot_ticket_coin',
    name: 'Ticket de Loot',
    description: 'Bilhete para abrir uma loot box Comum sem gastar moedas.',
    category: ShopCategory.SPECIAL,
    price: 300,
    icon: '🎁',
    reward: { type: ShopProductRewardType.SPECIAL_ITEM, itemKey: 'free_loot_ticket', quantity: 1 },
    available: true,
  },
  {
    key: 'booster_study_coin',
    name: 'Booster de Estudo',
    description: '+25% de XP por 30 minutos.',
    category: ShopCategory.SPECIAL,
    price: 320,
    icon: '⚡',
    reward: { type: ShopProductRewardType.SPECIAL_ITEM, itemKey: 'booster_study', quantity: 1 },
    available: true,
  },
  {
    key: 'xp_potion_coin',
    name: 'Soro de XP',
    description: 'Ganhe +40 XP instantâneo.',
    category: ShopCategory.SPECIAL,
    price: 120,
    icon: '🧪',
    reward: { type: ShopProductRewardType.SPECIAL_ITEM, itemKey: 'xp_potion_small', quantity: 1 },
    available: true,
  },
  {
    key: 'cafe_expresso_coin',
    name: 'Café Expresso',
    description: 'Um gole e +20 XP na hora.',
    category: ShopCategory.SPECIAL,
    price: 80,
    icon: '☕',
    reward: { type: ShopProductRewardType.SPECIAL_ITEM, itemKey: 'cafe_expresso', quantity: 1 },
    available: true,
  },
  {
    key: 'kit_escudo_coin',
    name: 'Kit de Escudo',
    description: 'Consumível que restaura 1 escudo de streak.',
    category: ShopCategory.SPECIAL,
    price: 110,
    icon: '🧰',
    reward: { type: ShopProductRewardType.SPECIAL_ITEM, itemKey: 'kit_escudo', quantity: 1 },
    available: true,
  },
];

export const SHOP_PRODUCTS_BY_KEY = Object.fromEntries(
  SHOP_PRODUCTS.map((product) => [product.key, product]),
) as Record<string, ShopProduct>;

export type ShopCatalogSection = {
  category: ShopCategoryValue;
  emoji: string;
  title: string;
  subtitle: string;
  products: ShopProduct[];
};

export const getAvailableShopProducts = (): ShopProduct[] =>
  SHOP_PRODUCTS.filter((product) => product.available);

export const getPurchasableLootBoxCount = (): number =>
  SHOP_PRODUCTS.filter(
    (product) => product.category === ShopCategory.LOOT_BOXES && product.available,
  ).length;

export const getTotalLootBoxCount = (): number =>
  SHOP_PRODUCTS.filter((product) => product.category === ShopCategory.LOOT_BOXES).length;

const isProductVisibleInCatalog = (product: ShopProduct): boolean =>
  product.available || product.category === ShopCategory.LOOT_BOXES;

export const getShopCatalogSections = (
  products: ShopProduct[] = SHOP_PRODUCTS,
): ShopCatalogSection[] =>
  SHOP_CATEGORY_ORDER.map((category) => {
    const categoryProducts = products.filter(
      (product) => isProductVisibleInCatalog(product) && product.category === category,
    );
    const meta = SHOP_CATEGORY_META[category];

    if (categoryProducts.length === 0 || !meta) return null;

    return {
      category,
      emoji: meta.emoji,
      title: meta.title,
      subtitle: meta.subtitle,
      products: categoryProducts,
    };
  }).filter((section): section is ShopCatalogSection => section !== null);

export const getProductsByCategory = (category: ShopCategoryValue): ShopProduct[] =>
  SHOP_PRODUCTS.filter((product) => product.available && product.category === category);

/** @deprecated Use SHOP_CATEGORY_ORDER */
export const CATEGORY_ORDER = SHOP_CATEGORY_ORDER;
