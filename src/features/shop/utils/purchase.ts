import { ShopProductRewardType, type ShopProduct } from '@/types/shop';

export const getDeliveredQuantity = (product: ShopProduct): number => {
  switch (product.reward.type) {
    case ShopProductRewardType.SHIELD:
      return product.reward.quantity;
    case ShopProductRewardType.LOOT_BOX:
      return product.reward.quantity;
    default:
      return 1;
  }
};

export const canAffordProduct = (coins: number, price: number): boolean => coins >= price;
