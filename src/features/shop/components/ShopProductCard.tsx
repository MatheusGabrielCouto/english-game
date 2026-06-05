import { Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { ShopProductRewardType, type ShopProduct } from '@/types/shop';
import { cn } from '@/utils';

import { LOOT_BOX_RARITY_STYLES } from '../constants/loot-box-rarity-styles';
import { SHOP_SURFACE, SHOP_TEXT } from '../constants/shop-ui';
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
        isLocked && 'border-border/80 opacity-85',
        !isLocked && canAfford && 'border-primary/25',
        !isLocked && !canAfford && 'border-border',
      )}>
      <View className={cn('h-1 w-full', lootRarity?.barClassName ?? 'bg-success/70')} />

      <View className="gap-3 p-4">
        <View className="flex-row items-start gap-3">
          <View
            className={cn(
              'relative h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-elevated',
              isLocked && 'opacity-70',
            )}>
            <Text className={cn('text-2xl', isLocked && 'opacity-60')}>{product.icon}</Text>
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
                <View className="rounded-md border border-border bg-surface-elevated px-2 py-0.5">
                  <Text className={SHOP_TEXT.badge}>Trancada</Text>
                </View>
              ) : null}
              {rewardDetail && !isLocked ? (
                <Text className={SHOP_TEXT.badge}>{rewardDetail}</Text>
              ) : null}
            </View>

            <Text className={`mt-1 ${SHOP_TEXT.headingSm}`}>{product.name}</Text>
            <Text className={`mt-1 ${SHOP_TEXT.body}`}>{product.description}</Text>

            {isLocked && product.unlockHint ? (
              <View className={`mt-2 ${SHOP_SURFACE.storyBox}`}>
                <Text className={SHOP_TEXT.kickerGold}>Como desbloquear</Text>
                <Text className={`mt-1 ${SHOP_TEXT.bodySmall}`}>{product.unlockHint}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {!isLocked ? (
          <View className="flex-row items-center justify-between gap-3 border-t border-border/60 pt-3">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-lg">🪙</Text>
              <Text className={cn(canAfford ? SHOP_TEXT.priceCoin : SHOP_TEXT.price)}>
                {product.price.toLocaleString('pt-BR')}
              </Text>
            </View>

            {!canAfford ? (
              <Text className={SHOP_TEXT.warning}>Moedas insuficientes</Text>
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
