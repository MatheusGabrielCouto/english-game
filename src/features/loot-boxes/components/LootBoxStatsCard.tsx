import { Text, View } from 'react-native';

import { Card } from '@/components';
import type { LootBoxAnalyticsRecord } from '@/types/loot-box';

type LootBoxStatsCardProps = {
  analytics: LootBoxAnalyticsRecord;
  availableCount: number;
};

export const LootBoxStatsCard = ({ analytics, availableCount }: LootBoxStatsCardProps) => (
  <Card elevated accent>
    <Text className="mb-1 text-base font-semibold text-foreground">Estatísticas</Text>
    <Text className="mb-4 text-sm text-foreground-secondary">
      {availableCount} caixa{availableCount === 1 ? '' : 's'} disponíve{availableCount === 1 ? 'l' : 'is'} para abrir
    </Text>
    <View className="flex-row flex-wrap gap-3">
      <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="text-xs text-foreground-secondary">Recebidas</Text>
        <Text className="mt-1 text-xl font-bold text-foreground">{analytics.totalReceived}</Text>
      </View>
      <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="text-xs text-foreground-secondary">Abertas</Text>
        <Text className="mt-1 text-xl font-bold text-primary">{analytics.totalOpened}</Text>
      </View>
      <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="text-xs text-foreground-secondary">Moedas ganhas</Text>
        <Text className="mt-1 text-xl font-bold text-accent">{analytics.totalCoinsFromBoxes}</Text>
      </View>
      <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="text-xs text-foreground-secondary">Maior prêmio</Text>
        <Text className="mt-1 text-xl font-bold text-warning">{analytics.biggestCoinReward}</Text>
      </View>
    </View>
  </Card>
);
