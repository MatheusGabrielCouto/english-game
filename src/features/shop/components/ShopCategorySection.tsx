import { Text, View } from 'react-native';

import type { ShopProduct } from '@/types/shop';

import type { ShopCatalogSection } from '../constants/shop-products';
import { SHOP_TEXT } from '../constants/shop-ui';
import { ShopProductCard } from './ShopProductCard';

type ShopCategorySectionProps = {
  section: ShopCatalogSection;
  canAfford: (product: ShopProduct) => boolean;
  onPurchase: (product: ShopProduct) => void;
};

export const ShopCategorySection = ({
  section,
  canAfford,
  onPurchase,
}: ShopCategorySectionProps) => (
  <View className="gap-3">
    <View className="flex-row items-start justify-between gap-3 px-0.5">
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="text-lg">{section.emoji}</Text>
          <Text className={SHOP_TEXT.heading}>{section.title}</Text>
        </View>
        <Text className={`mt-0.5 ${SHOP_TEXT.body}`}>{section.subtitle}</Text>
      </View>
      <View className="rounded-full border border-border bg-surface-elevated px-3 py-1">
        <Text className={SHOP_TEXT.countPill}>{section.products.length} itens</Text>
      </View>
    </View>

    <View className="gap-3">
      {section.products.map((product) => (
        <ShopProductCard
          key={product.key}
          product={product}
          canAfford={canAfford(product)}
          onPurchase={onPurchase}
        />
      ))}
    </View>
  </View>
);
