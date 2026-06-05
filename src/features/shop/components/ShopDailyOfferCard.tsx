import { Text, View } from 'react-native';

import { Button, Card } from '@/components';
import { ShopOfferKind, type ShopDailyOffer } from '@/types/shop-offer';
import { cn } from '@/utils';

import { SHOP_SURFACE, SHOP_TEXT } from '../constants/shop-ui';

type ShopDailyOfferCardProps = {
  offer: ShopDailyOffer;
  canAfford: boolean;
  isPurchasing: boolean;
  onPurchase: (offer: ShopDailyOffer) => void;
};

const CURRENCY_META = {
  [ShopOfferKind.COINS]: {
    label: 'Oferta do dia · Moedas',
    emoji: '🪙',
    accentClass: 'border-gold/40',
    barClass: 'bg-gold/80',
    labelClass: SHOP_TEXT.kickerGold,
    priceClass: SHOP_TEXT.priceCoin,
    insufficient: 'Moedas insuficientes para esta oferta.',
  },
  [ShopOfferKind.STUDY_POINTS]: {
    label: 'Oferta do dia · Study Points',
    emoji: '⚡',
    accentClass: 'border-accent/40',
    barClass: 'bg-accent/80',
    labelClass: SHOP_TEXT.kickerAccent,
    priceClass: SHOP_TEXT.priceAccent,
    insufficient: 'Study Points insuficientes para esta oferta.',
  },
} as const;

export const ShopDailyOfferCard = ({
  offer,
  canAfford,
  isPurchasing,
  onPurchase,
}: ShopDailyOfferCardProps) => {
  const savings = offer.originalPrice - offer.offerPrice;
  const isPurchased = offer.purchased;
  const currency = CURRENCY_META[offer.shopKind];

  return (
    <Card elevated accent className={cn('overflow-hidden p-0', currency.accentClass)}>
      <View className={cn('h-1.5 w-full', currency.barClass)} />

      <View className="gap-4 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <Text className={currency.labelClass}>✨ {currency.label}</Text>
            <Text className={SHOP_TEXT.heading}>{offer.title}</Text>
            <View className="mt-1 flex-row items-center gap-2">
              <Text className="text-xl">{offer.merchantEmoji}</Text>
              <Text className={SHOP_TEXT.caption}>{offer.merchantName}</Text>
            </View>
          </View>
          <View className="items-center rounded-2xl border border-border bg-surface-elevated px-3 py-2">
            <Text className="text-2xl">{offer.product.icon}</Text>
            <Text className={SHOP_TEXT.badge}>Item</Text>
          </View>
        </View>

        <View className={SHOP_SURFACE.storyBox}>
          <Text className={SHOP_TEXT.body}>{offer.story}</Text>
        </View>

        <View className={SHOP_SURFACE.metaBox}>
          <Text className={SHOP_TEXT.headingSm}>{offer.product.name}</Text>
          <Text className={`mt-1 ${SHOP_TEXT.bodySmall}`}>{offer.product.description}</Text>

          <View className="mt-3 flex-row flex-wrap items-end justify-between gap-3">
            <View className="gap-1">
              <Text className={SHOP_TEXT.badge}>Preço da oferta</Text>
              <View className="flex-row items-center gap-2">
                <Text className={SHOP_TEXT.priceStrike}>
                  {offer.originalPrice.toLocaleString('pt-BR')} {currency.emoji}
                </Text>
                <Text className={currency.priceClass}>
                  {offer.offerPrice.toLocaleString('pt-BR')} {currency.emoji}
                </Text>
              </View>
              <Text className={SHOP_TEXT.success}>
                −{offer.discountPercent}% · economize {savings.toLocaleString('pt-BR')} {currency.emoji}
              </Text>
            </View>

            {isPurchased ? (
              <View className="rounded-lg border border-success/40 bg-success/15 px-3 py-2">
                <Text className={SHOP_TEXT.success}>Resgatada hoje</Text>
              </View>
            ) : (
              <Button
                label={isPurchasing ? 'Processando...' : 'Aproveitar oferta'}
                size="sm"
                disabled={!canAfford || isPurchasing}
                onPress={() => onPurchase(offer)}
                accessibilityLabel={`Aproveitar oferta ${offer.title}`}
              />
            )}
          </View>

          {!isPurchased && !canAfford ? (
            <Text className={`mt-2 ${SHOP_TEXT.warning}`}>{currency.insufficient}</Text>
          ) : null}
        </View>
      </View>
    </Card>
  );
};
