import { create } from 'zustand';

type InventoryScreenState = {
  isLoading: boolean;
  isRefreshing: boolean;
  setLoading: (value: boolean) => void;
  setRefreshing: (value: boolean) => void;
};

export const useInventoryScreenStore = create<InventoryScreenState>((set) => ({
  isLoading: true,
  isRefreshing: false,

  setLoading: (value) => set({ isLoading: value }),
  setRefreshing: (value) => set({ isRefreshing: value }),
}));
