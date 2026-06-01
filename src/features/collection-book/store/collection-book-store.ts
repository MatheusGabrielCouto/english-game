import { create } from 'zustand';

import type { CollectibleCategoryValue, CollectionBookEntry } from '@/types/collectible';

export type CollectionBookCategorySummary = {
  key: CollectibleCategoryValue;
  label: string;
  emoji: string;
  discovered: number;
  total: number;
  percentage: number;
};

type CollectionBookStoreState = {
  entries: CollectionBookEntry[];
  categories: CollectionBookCategorySummary[];
  overallPercentage: number;
  isLoading: boolean;
};

export const useCollectionBookStore = create<CollectionBookStoreState>()(() => ({
  entries: [],
  categories: [],
  overallPercentage: 0,
  isLoading: true,
}));
