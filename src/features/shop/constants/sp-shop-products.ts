import { STUDY_POINTS_SHOP } from '@/features/game-design/catalogs/loot-economy';
import { LOOT_BOX_RARITY_CONFIG } from '@/features/inventory/constants';
import type { LootBoxRarityValue } from '@/types/inventory';

export type SpShopProductDisplay = {
  key: string;
  name: string;
  description: string;
  cost: number;
  icon: string;
  detail: string | null;
};

const SP_ITEM_META: Record<string, { description: string; icon: string; detail: string }> = {
  pet_egg: {
    description: 'Ovo misterioso — pode revelar uma nova espécie de pet.',
    icon: '🥚',
    detail: 'Item especial',
  },
  golden_ticket: {
    description: 'Ticket premium para recompensas especiais do jogo.',
    icon: '🎫',
    detail: 'Item especial',
  },
  free_loot_ticket: {
    description: 'Abra uma loot box grátis quando quiser.',
    icon: '🎁',
    detail: 'Ticket de loot',
  },
};

const buildSpShopProduct = (
  entry: (typeof STUDY_POINTS_SHOP)[number],
): SpShopProductDisplay => {
  if ('lootRarity' in entry && entry.lootRarity) {
    const rarity = entry.lootRarity as LootBoxRarityValue;
    const config = LOOT_BOX_RARITY_CONFIG[rarity];
    return {
      key: entry.key,
      name: entry.label,
      description: `Loot box ${config.label.toLowerCase()} para o inventário.`,
      cost: entry.cost,
      icon: config.emoji,
      detail: `Caixa ${config.label.toLowerCase()}`,
    };
  }

  const meta = 'itemKey' in entry && entry.itemKey ? SP_ITEM_META[entry.itemKey] : undefined;

  if (meta) {
    return {
      key: entry.key,
      name: entry.label,
      description: meta.description,
      cost: entry.cost,
      icon: meta.icon,
      detail: meta.detail,
    };
  }

  return {
    key: entry.key,
    name: entry.label,
    description: 'Item exclusivo da loja de Study Points.',
    cost: entry.cost,
    icon: '✨',
    detail: 'Item especial',
  };
};

export const SP_SHOP_PRODUCTS: SpShopProductDisplay[] = STUDY_POINTS_SHOP.map(buildSpShopProduct);

export const SP_SHOP_PRODUCTS_BY_KEY = Object.fromEntries(
  SP_SHOP_PRODUCTS.map((product) => [product.key, product]),
) as Record<string, SpShopProductDisplay>;

export const SP_SHOP_MESSAGES = {
  purchaseCompleted: 'Compra concluída com Study Points.',
  itemReceived: 'Item adicionado ao seu inventário.',
  insufficientSp: 'Study Points insuficientes.',
  purchaseCanceled: 'Compra cancelada.',
} as const;

export const SP_UPGRADE_MESSAGES = {
  success: 'Upgrade concluído! A nova loot box foi para o inventário.',
  no_box: 'Você precisa de uma loot box fechada dessa raridade no inventário.',
  insufficient_sp: 'Study Points insuficientes para este upgrade.',
} as const;

export const SP_SHOP_SECTION = {
  emoji: '⚡',
  title: 'Loja de Study Points',
  subtitle: 'Loot boxes e itens exclusivos — pague apenas com SP',
} as const;
