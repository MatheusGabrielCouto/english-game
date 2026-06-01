import { Text, View } from 'react-native';

import { Card, EmptyState } from '@/components';
import type { ShopPurchaseHistoryRecord } from '@/types/shop';

type ShopHistoryListProps = {
  history: ShopPurchaseHistoryRecord[];
};

const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

export const ShopHistoryList = ({ history }: ShopHistoryListProps) => {
  if (history.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Nenhuma compra ainda"
        description="Suas compras na loja aparecerão aqui."
      />
    );
  }

  return (
    <View className="gap-3">
      <View className="px-0.5">
        <Text className="text-lg font-black text-foreground">📜 Histórico</Text>
        <Text className="mt-0.5 text-sm text-foreground-secondary">Suas últimas compras</Text>
      </View>

      <View className="gap-2">
        {history.slice(0, 8).map((entry) => (
          <Card key={entry.id} elevated className="py-3">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">{entry.productName}</Text>
                <Text className="mt-1 text-xs text-foreground-secondary">
                  {entry.quantity}x · {formatDate(entry.purchasedAt)}
                </Text>
              </View>
              <Text className="text-sm font-bold text-coin">
                -{entry.pricePaid.toLocaleString('pt-BR')} 🪙
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </View>
  );
};
