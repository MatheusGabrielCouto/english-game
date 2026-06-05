import { create } from 'zustand';

import type { ShopProduct } from '@/types/shop';
import type { ShopDailyOffer } from '@/types/shop-offer';
import type { ShopStockItem } from '@/types/shop-stock';

import type { SpShopProductDisplay } from '../constants/sp-shop-products';

type ShopScreenState = {
  selectedProduct: ShopProduct | null;
  selectedDailyOffer: ShopDailyOffer | null;
  selectedStockItem: ShopStockItem | null;
  selectedSpProduct: SpShopProductDisplay | null;
  isPurchasing: boolean;
  toastMessage: string | null;
  toastKey: number;
  toastVariant: 'success' | 'info';
  setSelectedProduct: (product: ShopProduct | null) => void;
  setSelectedDailyOffer: (offer: ShopDailyOffer | null) => void;
  setSelectedStockItem: (item: ShopStockItem | null) => void;
  setSelectedSpProduct: (product: SpShopProductDisplay | null) => void;
  setIsPurchasing: (value: boolean) => void;
  showToast: (message: string, variant?: 'success' | 'info') => void;
  clearToast: () => void;
};

export const useShopScreenStore = create<ShopScreenState>()((set) => ({
  selectedProduct: null,
  selectedDailyOffer: null,
  selectedStockItem: null,
  selectedSpProduct: null,
  isPurchasing: false,
  toastMessage: null,
  toastKey: 0,
  toastVariant: 'success',
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedDailyOffer: (offer) => set({ selectedDailyOffer: offer }),
  setSelectedStockItem: (item) => set({ selectedStockItem: item }),
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
