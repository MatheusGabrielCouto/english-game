import { Text, View } from 'react-native';

import { Card, EmptyState } from '@/components';
import type { LootBoxOpenHistoryRecord } from '@/types/loot-box';

import { LOOT_BOX_RARITY_CONFIG } from '@/features/inventory/constants';

type LootBoxHistoryListProps = {
  history: LootBoxOpenHistoryRecord[];
};

export const LootBoxHistoryList = ({ history }: LootBoxHistoryListProps) => {
  if (history.length === 0) {
    return (
      <EmptyState
        icon="time-outline"
        title="Nenhuma abertura ainda"
        description="Suas recompensas reveladas aparecerão aqui."
      />
    );
  }

  return (
    <Card elevated>
      <Text className="mb-4 text-base font-semibold text-foreground">Histórico de aberturas</Text>
      <View className="gap-3">
        {history.map((entry) => {
          const config = LOOT_BOX_RARITY_CONFIG[entry.boxRarity];

          return (
            <View
              key={entry.id}
              className="rounded-xl border border-border bg-surface px-4 py-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Text>{config.emoji}</Text>
                  <Text className="text-sm font-medium text-foreground">{config.label}</Text>
                </View>
                <Text className="text-xs text-muted">
                  {new Date(entry.openedAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Text className="mt-2 text-sm text-accent">{entry.rewardLabel}</Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};
