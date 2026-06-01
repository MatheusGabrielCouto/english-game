import { Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { ShopProductRewardType, type ShopProduct } from '@/types/shop';
import { cn } from '@/utils';

import { LOOT_BOX_RARITY_STYLES } from '../constants/loot-box-rarity-styles';
import { LootBoxRarityBadge } from './LootBoxRarityBadge';

type ShopProductCardProps = {
  product: ShopProduct;
  canAfford: boolean;
  onPurchase: (product: ShopProduct) => void;
};

const getRewardDetail = (product: ShopProduct): string | null => {
  if (product.reward.type === ShopProductRewardType.SHIELD) {
    return product.reward.quantity > 1
      ? `${product.reward.quantity} escudos`
      : '1 escudo';
  }
  if (product.reward.type === ShopProductRewardType.LOOT_BOX) {
    const style = LOOT_BOX_RARITY_STYLES[product.reward.rarity];
    return style ? `Caixa ${style.label.toLowerCase()}` : '1 loot box';
  }
  return null;
};

export const ShopProductCard = ({ product, canAfford, onPurchase }: ShopProductCardProps) => {
  const isLocked = !product.available;
  const rewardDetail = getRewardDetail(product);
  const lootRarity =
    product.reward.type === ShopProductRewardType.LOOT_BOX
      ? LOOT_BOX_RARITY_STYLES[product.reward.rarity]
      : null;

  return (
    <Card
      elevated
      className={cn(
        'overflow-hidden p-0',
        isLocked && 'border-border/80 opacity-80',
        !isLocked && canAfford && 'border-primary/20',
        !isLocked && !canAfford && 'border-border opacity-95',
      )}>
      <View className={cn('h-1 w-full', lootRarity?.barClassName ?? 'bg-success/70')} />

      <View className="gap-3 p-4">
        <View className="flex-row items-start gap-3">
          <View
            className={cn(
              'relative h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface',
              isLocked && 'opacity-60',
            )}>
            <Text className={cn('text-2xl', isLocked && 'opacity-50')}>{product.icon}</Text>
            {isLocked ? (
              <View className="absolute -bottom-1 -right-1 rounded-full border border-border bg-surface-elevated px-1.5 py-0.5">
                <Text className="text-xs">🔒</Text>
              </View>
            ) : null}
          </View>

          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              {lootRarity ? (
                <LootBoxRarityBadge label={lootRarity.label} badge={lootRarity.badge} />
              ) : null}
              {isLocked ? (
                <View className="rounded-md border border-border bg-surface px-2 py-0.5">
                  <Text className="text-[10px] font-bold uppercase text-muted">Trancada</Text>
                </View>
              ) : null}
              {rewardDetail && !isLocked ? (
                <Text className="text-[10px] font-semibold uppercase text-foreground-secondary">
                  {rewardDetail}
                </Text>
              ) : null}
            </View>

            <Text className="mt-1 text-base font-bold text-foreground">{product.name}</Text>
            <Text className="mt-1 text-sm leading-relaxed text-foreground-secondary">
              {product.description}
            </Text>

            {isLocked && product.unlockHint ? (
              <View className="mt-2 rounded-xl border border-border/80 bg-surface-elevated/60 px-3 py-2">
                <Text className="text-[10px] font-bold uppercase tracking-wide text-gold">
                  Como desbloquear
                </Text>
                <Text className="mt-1 text-xs leading-relaxed text-foreground-secondary">
                  {product.unlockHint}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {!isLocked ? (
          <View className="flex-row items-center justify-between gap-3 border-t border-border/60 pt-3">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-lg">🪙</Text>
              <Text
                className={cn(
                  'text-xl font-black',
                  canAfford ? 'text-coin' : 'text-foreground-secondary',
                )}>
                {product.price.toLocaleString('pt-BR')}
              </Text>
            </View>

            {!canAfford ? (
              <Text className="text-xs font-medium text-muted">Moedas insuficientes</Text>
            ) : (
              <Button
                label="Comprar"
                size="sm"
                onPress={() => onPurchase(product)}
                accessibilityLabel={`Comprar ${product.name}`}
              />
            )}
          </View>
        ) : null}
      </View>
    </Card>
  );
};
