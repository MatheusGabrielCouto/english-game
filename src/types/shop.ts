import type { LootBoxRarityValue } from './inventory';

export const ShopCategory = {
  SHIELDS: 'shields',
  LOOT_BOXES: 'loot_boxes',
  PETS: 'pets',
  SPECIAL: 'special',
} as const;

export type ShopCategoryValue = (typeof ShopCategory)[keyof typeof ShopCategory];

export const ShopProductRewardType = {
  SHIELD: 'shield',
  LOOT_BOX: 'loot_box',
} as const;

export type ShopProductReward =
  | { type: typeof ShopProductRewardType.SHIELD; quantity: number }
  | { type: typeof ShopProductRewardType.LOOT_BOX; rarity: LootBoxRarityValue; quantity: number };

export type ShopProduct = {
  key: string;
  name: string;
  description: string;
  category: ShopCategoryValue;
  price: number;
  icon: string;
  reward: ShopProductReward;
  available: boolean;
  /** Shown on locked loot boxes — how to obtain this rarity elsewhere. */
  unlockHint?: string;
};

export type ShopPurchaseHistoryRecord = {
  id: number;
  productKey: string;
  productName: string;
  category: ShopCategoryValue;
  quantity: number;
  pricePaid: number;
  purchasedAt: string;
};

export type ShopAnalyticsRecord = {
  totalCoinsSpent: number;
  totalPurchases: number;
  totalItemsAcquired: number;
  shieldsPurchased: number;
  lootBoxesPurchased: number;
  lastPurchaseAt: string | null;
};

export type ShopProductStatsRecord = {
  productKey: string;
  category: ShopCategoryValue;
  purchaseCount: number;
  coinsSpent: number;
};

export type ShopAnalyticsSummary = ShopAnalyticsRecord & {
  averagePurchaseValue: number;
  topProduct: ShopProductStatsRecord | null;
  topCategory: { category: ShopCategoryValue; purchaseCount: number } | null;
};

export const ShopPurchaseFailureReason = {
  INSUFFICIENT_COINS: 'insufficient_coins',
  UNAVAILABLE: 'unavailable',
  CANCELLED: 'cancelled',
} as const;

export type ShopPurchaseFailureReasonValue =
  (typeof ShopPurchaseFailureReason)[keyof typeof ShopPurchaseFailureReason];

export type ShopPurchaseResult =
  | {
      success: true;
      product: ShopProduct;
      coinsSpent: number;
      quantity: number;
    }
  | {
      success: false;
      reason: ShopPurchaseFailureReasonValue;
    };
