import { Text, View } from 'react-native';

import { Modal } from '@/components';
import { cn } from '@/utils';

import type { SpShopProductDisplay } from '../constants/sp-shop-products';

type ShopSpPurchaseModalProps = {
  product: SpShopProductDisplay | null;
  balance: number;
  isPurchasing: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ShopSpPurchaseModal = ({
  product,
  balance,
  isPurchasing,
  onCancel,
  onConfirm,
}: ShopSpPurchaseModalProps) => {
  if (!product) return null;

  const canAfford = balance >= product.cost;
  const remaining = balance - product.cost;

  return (
    <Modal
      visible
      onRequestClose={onCancel}
      title="Confirmar compra com SP"
      description="Pagamento exclusivo em Study Points."
      confirmLabel={isPurchasing ? 'Processando...' : 'Confirmar'}
      cancelLabel="Cancelar"
      onConfirm={canAfford && !isPurchasing ? onConfirm : undefined}
      onCancel={onCancel}>
      <View className="gap-4 py-2">
        <View className="items-center gap-2">
          <Text className="text-4xl">{product.icon}</Text>
          <Text className="text-lg font-bold text-foreground">{product.name}</Text>
          <Text className="text-center text-sm text-foreground-secondary">{product.description}</Text>
        </View>

        <View className="rounded-xl border border-border bg-surface-elevated p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-muted">Custo</Text>
            <Text className="text-base font-bold text-accent">{product.cost.toLocaleString('pt-BR')} SP</Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-muted">Seu saldo</Text>
            <Text className="text-base font-semibold text-foreground">
              {balance.toLocaleString('pt-BR')} SP
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between border-t border-border/60 pt-2">
            <Text className="text-sm font-semibold text-foreground">Após compra</Text>
            <Text
              className={cn(
                'text-base font-bold',
                canAfford ? 'text-success' : 'text-warning',
              )}>
              {canAfford ? remaining.toLocaleString('pt-BR') : '—'} SP
            </Text>
          </View>
        </View>

        {!canAfford ? (
          <Text className="text-center text-sm text-warning">Study Points insuficientes para esta compra.</Text>
        ) : null}
      </View>
    </Modal>
  );
};
