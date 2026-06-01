import { create } from 'zustand';

import type { WishlistEntry } from '@/types/wishlist';

type WishlistStore = {
  entries: WishlistEntry[];
  wishlistedKeys: Set<string>;
  isLoading: boolean;
};

export const useWishlistStore = create<WishlistStore>(() => ({
  entries: [],
  wishlistedKeys: new Set(),
  isLoading: true,
}));
