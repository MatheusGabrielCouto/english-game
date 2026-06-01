import { Text, View } from 'react-native';

import { Modal } from '@/components';

import type { UseShopReturn } from '../hooks/use-shop';

type ShopPurchaseModalProps = {
  shop: UseShopReturn;
};

export const ShopPurchaseModal = ({ shop }: ShopPurchaseModalProps) => {
  const {
    coins,
    selectedProduct,
    isPurchasing,
    handleCancelPurchase,
    handleConfirmPurchase,
  } = shop;

  if (!selectedProduct) return null;

  const canAfford = coins >= selectedProduct.price;
  const remaining = coins - selectedProduct.price;

  return (
    <Modal
      visible
      onRequestClose={handleCancelPurchase}
      title="Confirmar compra"
      description="Revise os detalhes antes de concluir."
      confirmLabel={isPurchasing ? 'Processando...' : 'Confirmar'}
      cancelLabel="Cancelar"
      onConfirm={canAfford && !isPurchasing ? handleConfirmPurchase : undefined}
      onCancel={handleCancelPurchase}>
      <View className="gap-4 py-2">
        <View className="items-center gap-2">
          <Text className="text-4xl">{selectedProduct.icon}</Text>
          <Text className="text-lg font-bold text-foreground">{selectedProduct.name}</Text>
          <Text className="text-center text-sm text-foreground-secondary">
            {selectedProduct.description}
          </Text>
        </View>

        <View className="rounded-xl border border-border bg-surface-elevated p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-foreground-secondary">Preço</Text>
            <Text className="text-base font-bold text-accent">
              {selectedProduct.price.toLocaleString('pt-BR')} 🪙
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-foreground-secondary">Saldo atual</Text>
            <Text className="text-base font-semibold text-foreground">
              {coins.toLocaleString('pt-BR')} 🪙
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-foreground-secondary">Saldo após compra</Text>
            <Text
              className={`text-base font-semibold ${canAfford ? 'text-foreground' : 'text-danger'}`}>
              {canAfford ? remaining.toLocaleString('pt-BR') : '—'} 🪙
            </Text>
          </View>
        </View>

        {!canAfford ? (
          <Text className="text-center text-sm text-danger">Moedas insuficientes.</Text>
        ) : null}
      </View>
    </Modal>
  );
};
