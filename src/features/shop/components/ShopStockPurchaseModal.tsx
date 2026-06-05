import { Text, View } from 'react-native';

import { Modal } from '@/components';
import { ShopOfferKind } from '@/types/shop-offer';

import { SHOP_TEXT } from '../constants/shop-ui';
import type { UseShopReturn } from '../hooks/use-shop';

type ShopStockPurchaseModalProps = {
  shop: UseShopReturn;
};

export const ShopStockPurchaseModal = ({ shop }: ShopStockPurchaseModalProps) => {
  const {
    coins,
    studyPointsBalance,
    selectedStockItem,
    isPurchasing,
    handleCancelStockPurchase,
    handleConfirmStockPurchase,
  } = shop;

  if (!selectedStockItem) return null;

  const isCoins = selectedStockItem.shopKind === ShopOfferKind.COINS;
  const balance = isCoins ? coins : studyPointsBalance;
  const currencyEmoji = isCoins ? '🪙' : '⚡';
  const canAfford = balance >= selectedStockItem.price;
  const remaining = balance - selectedStockItem.price;
  const soldOut = selectedStockItem.stockRemaining <= 0;

  return (
    <Modal
      visible
      onRequestClose={handleCancelStockPurchase}
      title="Confirmar compra do estoque"
      description={`${selectedStockItem.resetLabel}. Estoque limitado.`}
      confirmLabel={isPurchasing ? 'Processando...' : 'Confirmar'}
      cancelLabel="Cancelar"
      onConfirm={canAfford && !isPurchasing && !soldOut ? handleConfirmStockPurchase : undefined}
      onCancel={handleCancelStockPurchase}>
      <View className="gap-4 py-2">
        <View className="items-center gap-2">
          <Text className="text-4xl">{selectedStockItem.product.icon}</Text>
          <Text className={SHOP_TEXT.heading}>{selectedStockItem.title}</Text>
          <Text className={`text-center ${SHOP_TEXT.body}`}>
            {selectedStockItem.merchantEmoji} {selectedStockItem.merchantName}
          </Text>
        </View>

        <View className="rounded-xl border border-border bg-surface-elevated px-4 py-3">
          <Text className={SHOP_TEXT.bodySmall}>{selectedStockItem.story}</Text>
        </View>

        <View className="rounded-xl border border-border bg-surface-elevated p-4">
          <View className="flex-row items-center justify-between">
            <Text className={SHOP_TEXT.label}>Item</Text>
            <Text className="text-sm font-semibold text-foreground">
              {selectedStockItem.product.name}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className={SHOP_TEXT.label}>Preço</Text>
            <Text className="text-base font-bold text-accent">
              {selectedStockItem.price.toLocaleString('pt-BR')} {currencyEmoji}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className={SHOP_TEXT.label}>Estoque</Text>
            <Text className="text-sm font-semibold text-foreground">
              {selectedStockItem.stockRemaining}/{selectedStockItem.maxStock}
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

        {soldOut ? (
          <Text className={`text-center ${SHOP_TEXT.warning}`}>Este item esgotou.</Text>
        ) : null}
        {!soldOut && !canAfford ? (
          <Text className={`text-center ${SHOP_TEXT.warning}`}>
            {isCoins ? 'Moedas insuficientes.' : 'Study Points insuficientes.'}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
};
