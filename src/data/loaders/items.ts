import itemsJson from '../items.json';
import type { GameItemDefinition, ItemsDataFile } from '../types';

const itemsData = itemsJson as ItemsDataFile;

export const getItemsData = (): ItemsDataFile => itemsData;

export const GAME_ITEM_CATALOG: GameItemDefinition[] = itemsData.items;

export const GAME_ITEMS_BY_KEY = Object.fromEntries(
  GAME_ITEM_CATALOG.map((entry) => [entry.key, entry]),
) as Record<string, GameItemDefinition>;

export const LEGACY_ITEM_KEY_ALIASES: Record<string, string> = itemsData.legacyAliases;

export const resolveGameItem = (itemKey: string): GameItemDefinition | undefined => {
  const direct = GAME_ITEMS_BY_KEY[itemKey];
  if (direct) return direct;

  const alias = LEGACY_ITEM_KEY_ALIASES[itemKey];
  if (alias) return GAME_ITEMS_BY_KEY[alias];

  return undefined;
};

export const isItemUsable = (itemKey: string): boolean => {
  const def = resolveGameItem(itemKey);
  if (!def) return false;
  return def.usable !== false;
};
