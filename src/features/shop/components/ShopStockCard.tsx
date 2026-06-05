import { Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { ShopOfferKind, type ShopOfferKindValue } from '@/types/shop-offer';
import type { ShopStockItem, ShopStockPeriodValue } from '@/types/shop-stock';
import { ShopStockPeriod } from '@/types/shop-stock';
import { cn } from '@/utils';

import { SHOP_SURFACE, SHOP_TEXT } from '../constants/shop-ui';

type ShopStockCardProps = {
  item: ShopStockItem;
  canAfford: boolean;
  isPurchasing: boolean;
  onPurchase: (item: ShopStockItem) => void;
};

const PERIOD_META: Record<ShopStockPeriodValue, { badgeClass: string }> = {
  [ShopStockPeriod.DAILY]: { badgeClass: SHOP_TEXT.stockDaily },
  [ShopStockPeriod.WEEKLY]: { badgeClass: SHOP_TEXT.stockWeekly },
};

const CURRENCY_EMOJI: Record<ShopOfferKindValue, string> = {
  [ShopOfferKind.COINS]: '🪙',
  [ShopOfferKind.STUDY_POINTS]: '⚡',
};

export const ShopStockCard = ({
  item,
  canAfford,
  isPurchasing,
  onPurchase,
}: ShopStockCardProps) => {
  const soldOut = item.stockRemaining <= 0;
  const periodMeta = PERIOD_META[item.periodType];
  const currencyEmoji = CURRENCY_EMOJI[item.shopKind];
  const stockRatio = item.maxStock > 0 ? item.stockRemaining / item.maxStock : 0;

  return (
    <Card
      elevated
      className={cn(
        'overflow-hidden p-0',
        soldOut && 'opacity-80',
        item.shopKind === ShopOfferKind.COINS ? 'border-gold/30' : 'border-accent/30',
      )}>
      <View
        className={cn(
          'h-1 w-full',
          item.shopKind === ShopOfferKind.COINS ? 'bg-gold/70' : 'bg-accent/70',
        )}
      />

      <View className="gap-3 p-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className={periodMeta.badgeClass}>
                {item.periodType === ShopStockPeriod.DAILY ? 'Diário' : 'Semanal'}
              </Text>
              <Text className={SHOP_TEXT.caption}>{item.resetLabel}</Text>
            </View>
            <Text className={SHOP_TEXT.headingSm}>{item.title}</Text>
            <Text className={SHOP_TEXT.caption}>
              {item.merchantEmoji} {item.merchantName}
            </Text>
          </View>
          <Text className="text-2xl">{item.product.icon}</Text>
        </View>

        <Text className={SHOP_TEXT.bodySmall}>{item.story}</Text>

        <View className={SHOP_SURFACE.metaBox}>
          <View className="flex-row items-center justify-between">
            <Text className={SHOP_TEXT.headingSm}>{item.product.name}</Text>
            <Text className={SHOP_TEXT.price}>
              {item.price.toLocaleString('pt-BR')} {currencyEmoji}
            </Text>
          </View>

          <View className="mt-3 h-2 overflow-hidden rounded-full bg-background/80">
            <View
              className={cn(
                'h-full rounded-full',
                soldOut ? 'bg-border' : stockRatio <= 0.33 ? 'bg-warning' : 'bg-success',
              )}
              style={{ width: `${Math.max(stockRatio * 100, soldOut ? 0 : 8)}%` }}
            />
          </View>
          <Text className={`mt-1 ${SHOP_TEXT.caption}`}>
            {soldOut ? 'Esgotado' : `${item.stockRemaining}/${item.maxStock} restantes`}
          </Text>
        </View>

        {!soldOut ? (
          <Button
            label={isPurchasing ? 'Processando...' : 'Comprar do estoque'}
            size="sm"
            disabled={!canAfford || isPurchasing}
            onPress={() => onPurchase(item)}
            accessibilityLabel={`Comprar ${item.product.name} do estoque`}
          />
        ) : (
          <View className="rounded-lg border border-border bg-surface-elevated px-3 py-2">
            <Text className={`text-center ${SHOP_TEXT.hint}`}>Aguarde a próxima reposição</Text>
          </View>
        )}

        {!soldOut && !canAfford ? (
          <Text className={`text-center ${SHOP_TEXT.warning}`}>
            {item.shopKind === ShopOfferKind.COINS
              ? 'Moedas insuficientes'
              : 'Study Points insuficientes'}
          </Text>
        ) : null}
      </View>
    </Card>
  );
};
