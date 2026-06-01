import { create } from 'zustand';

import type { ShopProduct } from '@/types/shop';

import type { SpShopProductDisplay } from '../constants/sp-shop-products';

type ShopScreenState = {
  selectedProduct: ShopProduct | null;
  selectedSpProduct: SpShopProductDisplay | null;
  isPurchasing: boolean;
  toastMessage: string | null;
  toastKey: number;
  toastVariant: 'success' | 'info';
  setSelectedProduct: (product: ShopProduct | null) => void;
  setSelectedSpProduct: (product: SpShopProductDisplay | null) => void;
  setIsPurchasing: (value: boolean) => void;
  showToast: (message: string, variant?: 'success' | 'info') => void;
  clearToast: () => void;
};

export const useShopScreenStore = create<ShopScreenState>()((set) => ({
  selectedProduct: null,
  selectedSpProduct: null,
  isPurchasing: false,
  toastMessage: null,
  toastKey: 0,
  toastVariant: 'success',
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedSpProduct: (product) => set({ selectedSpProduct: product }),
  setIsPurchasing: (value) => set({ isPurchasing: value }),
  showToast: (message, variant = 'success') =>
    set((state) => ({
      toastMessage: message,
      toastVariant: variant,
      toastKey: state.toastKey + 1,
    })),
  clearToast: () => set({ toastMessage: null }),
}));
