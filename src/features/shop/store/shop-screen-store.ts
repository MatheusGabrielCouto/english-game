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
  setSelectedProduct: (product: ShopProduct | null) => void;
  setSelectedDailyOffer: (offer: ShopDailyOffer | null) => void;
  setSelectedStockItem: (item: ShopStockItem | null) => void;
  setSelectedSpProduct: (product: SpShopProductDisplay | null) => void;
  setIsPurchasing: (value: boolean) => void;
};

export const useShopScreenStore = create<ShopScreenState>()((set) => ({
  selectedProduct: null,
  selectedDailyOffer: null,
  selectedStockItem: null,
  selectedSpProduct: null,
  isPurchasing: false,
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedDailyOffer: (offer) => set({ selectedDailyOffer: offer }),
  setSelectedStockItem: (item) => set({ selectedStockItem: item }),
  setSelectedSpProduct: (product) => set({ selectedSpProduct: product }),
  setIsPurchasing: (value) => set({ isPurchasing: value }),
}));
