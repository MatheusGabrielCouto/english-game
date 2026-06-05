import type { ShopOfferKindValue, ShopOfferProductView } from './shop-offer';

export const ShopStockPeriod = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
} as const;

export type ShopStockPeriodValue = (typeof ShopStockPeriod)[keyof typeof ShopStockPeriod];

export type ShopStockCatalogEntry = {
  id: string;
  period: ShopStockPeriodValue;
  shopKind: ShopOfferKindValue;
  productKey: string;
  maxStock: number;
  title: string;
  story: string;
  merchantName: string;
  merchantEmoji: string;
  weight: number;
};

export type ShopStockSlotRecord = {
  storageKey: string;
  periodType: ShopStockPeriodValue;
  periodKey: string;
  shopKind: ShopOfferKindValue;
  catalogStockId: string;
  productKey: string;
  maxStock: number;
  stockRemaining: number;
  createdAt: string;
};

export type ShopStockItem = {
  storageKey: string;
  periodType: ShopStockPeriodValue;
  periodKey: string;
  shopKind: ShopOfferKindValue;
  catalogStockId: string;
  title: string;
  story: string;
  merchantName: string;
  merchantEmoji: string;
  productKey: string;
  product: ShopOfferProductView;
  price: number;
  maxStock: number;
  stockRemaining: number;
  resetLabel: string;
};

export const ShopStockFailureReason = {
  OUT_OF_STOCK: 'out_of_stock',
  EXPIRED: 'expired',
  UNAVAILABLE: 'unavailable',
} as const;

export type ShopStockFailureReasonValue =
  (typeof ShopStockFailureReason)[keyof typeof ShopStockFailureReason];

export type ShopStockPurchaseResult =
  | {
      success: true;
      item: ShopStockItem;
      amountSpent: number;
      quantity: number;
      currency: ShopOfferKindValue;
    }
  | {
      success: false;
      reason: ShopStockFailureReasonValue | import('./shop').ShopPurchaseFailureReasonValue;
    };

export type ShopStockSnapshot = {
  daily: { coins: ShopStockItem[]; studyPoints: ShopStockItem[] };
  weekly: { coins: ShopStockItem[]; studyPoints: ShopStockItem[] };
};
