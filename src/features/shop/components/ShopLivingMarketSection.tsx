import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { ShopDailyOffer } from '@/types/shop-offer';
import type { ShopStockItem, ShopStockSnapshot } from '@/types/shop-stock';

import { SHOP_TEXT } from '../constants/shop-ui';
import { ShopDailyOfferCard } from './ShopDailyOfferCard';
import { ShopSectionHeader } from './ShopSectionHeader';
import { ShopStockCard } from './ShopStockCard';

type ShopLivingMarketSectionProps = {
  dailyOfferCoins: ShopDailyOffer | null;
  dailyOfferSp: ShopDailyOffer | null;
  stock: ShopStockSnapshot;
  canAffordOffer: (offer: ShopDailyOffer) => boolean;
  canAffordStock: (item: ShopStockItem) => boolean;
  isPurchasing: boolean;
  onPurchaseOffer: (offer: ShopDailyOffer) => void;
  onPurchaseStock: (item: ShopStockItem) => void;
};

const StockBlock = ({
  label,
  items,
  canAffordStock,
  isPurchasing,
  onPurchaseStock,
}: {
  label: string;
  items: ShopStockItem[];
  canAffordStock: (item: ShopStockItem) => boolean;
  isPurchasing: boolean;
  onPurchaseStock: (item: ShopStockItem) => void;
}) => {
  if (items.length === 0) return null;

  return (
    <View className="gap-2">
      <Text className={SHOP_TEXT.caption}>{label}</Text>
      <View className="gap-3">
        {items.map((item) => (
          <ShopStockCard
            key={item.storageKey}
            item={item}
            canAfford={canAffordStock(item)}
            isPurchasing={isPurchasing}
            onPurchase={onPurchaseStock}
          />
        ))}
      </View>
    </View>
  );
};

const StockPeriodSection = ({
  title,
  kickerClassName,
  coins,
  studyPoints,
  canAffordStock,
  isPurchasing,
  onPurchaseStock,
}: {
  title: string;
  kickerClassName: string;
  coins: ShopStockItem[];
  studyPoints: ShopStockItem[];
  canAffordStock: (item: ShopStockItem) => boolean;
  isPurchasing: boolean;
  onPurchaseStock: (item: ShopStockItem) => void;
}) => {
  if (coins.length === 0 && studyPoints.length === 0) return null;

  return (
    <View className="gap-3">
      <ShopSectionHeader
        kicker={title}
        kickerClassName={kickerClassName}
        title="Seleção limitada"
        subtitle="Quantidade finita por item — quando esgota, aguarde a próxima reposição."
      />
      <StockBlock
        label="🪙 Moedas"
        items={coins}
        canAffordStock={canAffordStock}
        isPurchasing={isPurchasing}
        onPurchaseStock={onPurchaseStock}
      />
      <StockBlock
        label="⚡ Study Points"
        items={studyPoints}
        canAffordStock={canAffordStock}
        isPurchasing={isPurchasing}
        onPurchaseStock={onPurchaseStock}
      />
    </View>
  );
};

export const ShopLivingMarketSection = ({
  dailyOfferCoins,
  dailyOfferSp,
  stock,
  canAffordOffer,
  canAffordStock,
  isPurchasing,
  onPurchaseOffer,
  onPurchaseStock,
}: ShopLivingMarketSectionProps) => {
  const hasOffers = dailyOfferCoins != null || dailyOfferSp != null;
  const hasStock =
    stock.daily.coins.length > 0 ||
    stock.daily.studyPoints.length > 0 ||
    stock.weekly.coins.length > 0 ||
    stock.weekly.studyPoints.length > 0;

  if (!hasOffers && !hasStock) return null;

  return (
    <View className="gap-5">
      <GameCard variant="quest" glow className="border-primary/30">
        <Text className={SHOP_TEXT.kickerPrimary}>🏪 Loja viva</Text>
        <Text className={`mt-2 ${SHOP_TEXT.body}`}>
          Ofertas com desconto, estoque diário e remessas semanais. Tudo gira com histórias e
          quantidade finita — quando esgota, só na próxima reposição.
        </Text>
      </GameCard>

      {hasOffers ? (
        <View className="gap-3">
          <ShopSectionHeader
            kicker="✨ Ofertas especiais"
            kickerClassName={SHOP_TEXT.kickerGold}
            title="Promoções de hoje"
            subtitle="Uma oferta por moeda por dia, com desconto e narrativa exclusiva."
          />
          {dailyOfferCoins ? (
            <ShopDailyOfferCard
              offer={dailyOfferCoins}
              canAfford={canAffordOffer(dailyOfferCoins)}
              isPurchasing={isPurchasing}
              onPurchase={onPurchaseOffer}
            />
          ) : null}
          {dailyOfferSp ? (
            <ShopDailyOfferCard
              offer={dailyOfferSp}
              canAfford={canAffordOffer(dailyOfferSp)}
              isPurchasing={isPurchasing}
              onPurchase={onPurchaseOffer}
            />
          ) : null}
        </View>
      ) : null}

      <StockPeriodSection
        title="📅 Estoque diário"
        kickerClassName={SHOP_TEXT.stockDaily}
        coins={stock.daily.coins}
        studyPoints={stock.daily.studyPoints}
        canAffordStock={canAffordStock}
        isPurchasing={isPurchasing}
        onPurchaseStock={onPurchaseStock}
      />

      <StockPeriodSection
        title="🗓️ Estoque semanal"
        kickerClassName={SHOP_TEXT.stockWeekly}
        coins={stock.weekly.coins}
        studyPoints={stock.weekly.studyPoints}
        canAffordStock={canAffordStock}
        isPurchasing={isPurchasing}
        onPurchaseStock={onPurchaseStock}
      />
    </View>
  );
};
