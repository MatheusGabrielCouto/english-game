import type { SpShopProductDisplay } from '@/features/shop/constants/sp-shop-products';
import type { ShopProduct } from './shop';

export const ShopOfferKind = {
  COINS: 'coins',
  STUDY_POINTS: 'study_points',
} as const;

export type ShopOfferKindValue = (typeof ShopOfferKind)[keyof typeof ShopOfferKind];

export type ShopOfferCatalogEntry = {
  id: string;
  shopKind: ShopOfferKindValue;
  title: string;
  story: string;
  merchantName: string;
  merchantEmoji: string;
  productKey: string;
  discountPercent: number;
  weight: number;
};

export type ShopDailyOfferRecord = {
  dateKey: string;
  hasOffer: boolean;
  catalogOfferId: string | null;
  productKey: string | null;
  discountPercent: number | null;
  offerPrice: number | null;
  originalPrice: number | null;
  purchased: boolean;
  createdAt: string;
};

export type ShopOfferProductView = {
  key: string;
  name: string;
  description: string;
  icon: string;
  detail?: string | null;
};

export type ShopDailyOffer = {
  shopKind: ShopOfferKindValue;
  storageKey: string;
  dateKey: string;
  catalogOfferId: string;
  title: string;
  story: string;
  merchantName: string;
  merchantEmoji: string;
  productKey: string;
  product: ShopOfferProductView;
  discountPercent: number;
  originalPrice: number;
  offerPrice: number;
  purchased: boolean;
  coinsProduct?: ShopProduct;
  spProduct?: SpShopProductDisplay;
};

export const ShopOfferFailureReason = {
  NO_OFFER_TODAY: 'no_offer_today',
  ALREADY_PURCHASED: 'already_purchased',
  EXPIRED: 'expired',
  UNAVAILABLE: 'unavailable',
} as const;

export type ShopOfferFailureReasonValue =
  (typeof ShopOfferFailureReason)[keyof typeof ShopOfferFailureReason];

export type ShopOfferPurchaseResult =
  | {
      success: true;
      offer: ShopDailyOffer;
      amountSpent: number;
      quantity: number;
      currency: ShopOfferKindValue;
    }
  | {
      success: false;
      reason: ShopOfferFailureReasonValue | import('./shop').ShopPurchaseFailureReasonValue;
    };
