import { Text, View } from 'react-native';

import { Card } from '@/components';
import type { ShopPurchaseHistoryRecord } from '@/types/shop';

import { SHOP_TEXT } from '../constants/shop-ui';

type ShopHistoryListProps = {
  history: ShopPurchaseHistoryRecord[];
};

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ShopHistoryList = ({ history }: ShopHistoryListProps) => (
  <View className="gap-3">
    <View className="px-0.5">
      <Text className={SHOP_TEXT.heading}>📜 Histórico</Text>
      <Text className={`mt-0.5 ${SHOP_TEXT.body}`}>Suas últimas compras</Text>
    </View>

    <Card elevated className="gap-0 p-0">
      {history.map((entry, index) => (
        <View
          key={entry.id}
          className={`flex-row items-center justify-between px-4 py-3 ${
            index < history.length - 1 ? 'border-b border-border/60' : ''
          }`}>
          <View className="flex-1 pr-3">
            <Text className="text-sm font-semibold text-foreground">{entry.productName}</Text>
            <Text className={`mt-1 ${SHOP_TEXT.bodySmall}`}>{formatDate(entry.purchasedAt)}</Text>
          </View>
          <Text className="text-sm font-bold text-coin">
            −{entry.pricePaid.toLocaleString('pt-BR')} 🪙
          </Text>
        </View>
      ))}
    </Card>
  </View>
);
