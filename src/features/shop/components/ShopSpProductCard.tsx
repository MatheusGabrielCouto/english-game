import { Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { cn } from '@/utils';

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
      canAfford ? 'border-accent/25' : 'border-border opacity-95',
    )}>
    <View className="h-1 w-full bg-accent/70" />

    <View className={cn('gap-3', compact ? 'p-3' : 'p-4')}>
      <View className={cn('flex-row gap-3', compact ? 'items-center' : 'items-start')}>
        <View
          className={cn(
            'items-center justify-center rounded-2xl border border-border bg-surface',
            compact ? 'h-10 w-10' : 'h-12 w-12',
          )}>
          <Text className={compact ? 'text-xl' : 'text-2xl'}>{product.icon}</Text>
        </View>

        <View className="min-w-0 flex-1">
          {product.detail && !compact ? (
            <Text className="text-[10px] font-semibold uppercase text-accent">{product.detail}</Text>
          ) : null}
          <Text className={cn('font-bold text-foreground', compact ? 'text-sm' : 'mt-1 text-base')} numberOfLines={2}>
            {product.name}
          </Text>
          {!compact ? (
            <Text className="mt-1 text-sm leading-relaxed text-foreground-secondary">{product.description}</Text>
          ) : null}
        </View>
      </View>

      <View className="flex-row items-center justify-between gap-2 border-t border-border/60 pt-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-base">⚡</Text>
          <Text
            className={cn(
              'font-black',
              compact ? 'text-base' : 'text-xl',
              canAfford ? 'text-accent' : 'text-foreground-secondary',
            )}>
            {product.cost.toLocaleString('pt-BR')}
          </Text>
        </View>

        {!canAfford ? (
          <Text className="text-[10px] font-medium text-muted">SP insuf.</Text>
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
