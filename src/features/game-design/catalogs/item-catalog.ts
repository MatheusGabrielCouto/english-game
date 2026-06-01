export const ItemCategory = {
  CONSUMABLE: 'consumable',
  BOOSTER: 'booster',
  TICKET: 'ticket',
  KEY: 'key',
  RELIC: 'relic',
} as const;

export type ItemCategoryValue = (typeof ItemCategory)[keyof typeof ItemCategory];

export type {
    GameItemDefinition,
    ItemEffectType
} from '@/data/types';

export {
    GAME_ITEMS_BY_KEY, GAME_ITEM_CATALOG, LEGACY_ITEM_KEY_ALIASES, isItemUsable, resolveGameItem
} from '@/data/loaders/items';

