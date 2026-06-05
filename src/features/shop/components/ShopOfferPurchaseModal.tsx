import { Text, View } from 'react-native';

import { Modal } from '@/components';
import { ShopOfferKind } from '@/types/shop-offer';

import { SHOP_TEXT } from '../constants/shop-ui';
import type { UseShopReturn } from '../hooks/use-shop';

type ShopOfferPurchaseModalProps = {
  shop: UseShopReturn;
};

export const ShopOfferPurchaseModal = ({ shop }: ShopOfferPurchaseModalProps) => {
  const {
    coins,
    studyPointsBalance,
    selectedDailyOffer,
    isPurchasing,
    handleCancelOfferPurchase,
    handleConfirmOfferPurchase,
  } = shop;

  if (!selectedDailyOffer) return null;

  const isCoinsOffer = selectedDailyOffer.shopKind === ShopOfferKind.COINS;
  const balance = isCoinsOffer ? coins : studyPointsBalance;
  const currencyEmoji = isCoinsOffer ? '🪙' : '⚡';
  const canAfford = balance >= selectedDailyOffer.offerPrice;
  const remaining = balance - selectedDailyOffer.offerPrice;

  return (
    <Modal
      visible
      onRequestClose={handleCancelOfferPurchase}
      title={isCoinsOffer ? 'Confirmar oferta de moedas' : 'Confirmar oferta de Study Points'}
      description="Esta promoção vale apenas hoje."
      confirmLabel={isPurchasing ? 'Processando...' : 'Confirmar oferta'}
      cancelLabel="Cancelar"
      onConfirm={canAfford && !isPurchasing ? handleConfirmOfferPurchase : undefined}
      onCancel={handleCancelOfferPurchase}>
      <View className="gap-4 py-2">
        <View className="items-center gap-2">
          <Text className="text-4xl">{selectedDailyOffer.product.icon}</Text>
          <Text className={SHOP_TEXT.heading}>{selectedDailyOffer.title}</Text>
          <Text className={`text-center ${SHOP_TEXT.body}`}>
            {selectedDailyOffer.merchantEmoji} {selectedDailyOffer.merchantName}
          </Text>
        </View>

        <View className="rounded-xl border border-border bg-surface-elevated px-4 py-3">
          <Text className={SHOP_TEXT.bodySmall}>{selectedDailyOffer.story}</Text>
        </View>

        <View className="rounded-xl border border-border bg-surface-elevated p-4">
          <View className="flex-row items-center justify-between">
            <Text className={SHOP_TEXT.label}>Preço original</Text>
            <Text className={SHOP_TEXT.priceStrike}>
              {selectedDailyOffer.originalPrice.toLocaleString('pt-BR')} {currencyEmoji}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className={SHOP_TEXT.label}>Preço da oferta</Text>
            <Text className="text-base font-bold text-accent">
              {selectedDailyOffer.offerPrice.toLocaleString('pt-BR')} {currencyEmoji}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className={SHOP_TEXT.label}>Saldo atual</Text>
            <Text className="text-base font-semibold text-foreground">
              {balance.toLocaleString('pt-BR')} {currencyEmoji}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className={SHOP_TEXT.label}>Saldo após compra</Text>
            <Text
              className={`text-base font-semibold ${canAfford ? 'text-foreground' : 'text-danger'}`}>
              {canAfford ? remaining.toLocaleString('pt-BR') : '—'} {currencyEmoji}
            </Text>
          </View>
        </View>

        {!canAfford ? (
          <Text className={`text-center ${SHOP_TEXT.warning}`}>
            {isCoinsOffer ? 'Moedas insuficientes.' : 'Study Points insuficientes.'}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
};
