import { Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { cn } from '@/utils';

import { SHOP_TEXT } from '../constants/shop-ui';
import type { SpShopProductDisplay } from '../constants/sp-shop-products';

type ShopSpProductCardProps = {
  product: SpShopProductDisplay;
  canAfford: boolean;
  onPurchase: (product: SpShopProductDisplay) => void;
  compact?: boolean;
};

export const ShopSpProductCard = ({
  product,
  canAfford,
  onPurchase,
  compact = false,
}: ShopSpProductCardProps) => (
  <Card
    elevated
    className={cn(
      'overflow-hidden p-0',
      canAfford ? 'border-accent/30' : 'border-border',
    )}>
    <View className="h-1 w-full bg-accent/70" />

    <View className={cn('gap-3', compact ? 'p-3' : 'p-4')}>
      <View className={cn('flex-row gap-3', compact ? 'items-center' : 'items-start')}>
        <View
          className={cn(
            'items-center justify-center rounded-2xl border border-border bg-surface-elevated',
            compact ? 'h-10 w-10' : 'h-12 w-12',
          )}>
          <Text className={compact ? 'text-xl' : 'text-2xl'}>{product.icon}</Text>
        </View>

        <View className="min-w-0 flex-1">
          {product.detail && !compact ? (
            <Text className={SHOP_TEXT.kickerAccent}>{product.detail}</Text>
          ) : null}
          <Text
            className={cn(SHOP_TEXT.headingSm, compact ? 'text-sm' : 'mt-1')}
            numberOfLines={2}>
            {product.name}
          </Text>
          {!compact ? (
            <Text className={`mt-1 ${SHOP_TEXT.body}`}>{product.description}</Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-center justify-between gap-2 border-t border-border/60 pt-3">
        <View className="flex-row items-center gap-1">
          <Text className="">⚡</Text>
          <Text className={cn(canAfford ? SHOP_TEXT.priceAccent : SHOP_TEXT.price, compact && '')}>
            {product.cost.toLocaleString('pt-BR')}
          </Text>
        </View>

        {!canAfford ? (
          <Text className={SHOP_TEXT.warning}>SP insuf.</Text>
        ) : (
          <Button
            label="Comprar"
            size="sm"
            onPress={() => onPurchase(product)}
            accessibilityLabel={`Comprar ${product.name} com Study Points`}
          />
        )}
      </View>
    </View>
  </Card>
);
