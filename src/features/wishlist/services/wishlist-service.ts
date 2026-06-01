import { COLLECTIBLE_BY_KEY } from '@/features/game-design/catalogs/collectible-catalog';
import {
  addWishlistItem,
  getWishlistEntries,
  removeWishlistItem,
} from '@/storage/repositories/wishlist-repository';
import { MAX_WISHLIST_SIZE, type WishlistEntry } from '@/types/wishlist';

import { useWishlistStore } from '../store/wishlist-store';

export const DEFAULT_WISHLIST_KEYS = [
  'relic_3',
  'legendary_dragon_pet',
  'faang_invitation',
  'world_class_engineer_medal',
] as const;

const refreshStore = async (): Promise<void> => {
  const entries = await getWishlistEntries();
  useWishlistStore.setState({
    entries,
    wishlistedKeys: new Set(entries.map((entry) => entry.itemKey)),
    isLoading: false,
  });
};

const seedDefaultWishlist = async (): Promise<void> => {
  const existing = await getWishlistEntries();
  if (existing.length > 0) return;

  for (const key of DEFAULT_WISHLIST_KEYS) {
    if (COLLECTIBLE_BY_KEY[key]) {
      await addWishlistItem(key);
    }
  }
};

export type WishlistItemView = WishlistEntry & {
  name: string;
  icon: string;
  rarity: string;
  discovered: boolean;
};

export const WishlistService = {
  async initialize(): Promise<void> {
    await seedDefaultWishlist();
    await refreshStore();
  },

  async toggle(itemKey: string): Promise<boolean> {
    const item = COLLECTIBLE_BY_KEY[itemKey];
    if (!item) return false;

    const { wishlistedKeys } = useWishlistStore.getState();
    if (wishlistedKeys.has(itemKey)) {
      await removeWishlistItem(itemKey);
      await refreshStore();
      return false;
    }

    if (wishlistedKeys.size >= MAX_WISHLIST_SIZE) return false;

    await addWishlistItem(itemKey);
    await refreshStore();
    return true;
  },

  isWishlisted(itemKey: string): boolean {
    return useWishlistStore.getState().wishlistedKeys.has(itemKey);
  },

  async refresh(): Promise<void> {
    await refreshStore();
  },
};
