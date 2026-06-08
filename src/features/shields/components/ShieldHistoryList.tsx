import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card, EmptyState } from '@/components';
import type { ShieldUsageRecord } from '@/types/shield';

import { formatStudyDateLabel } from '@/features/streak/utils/date';
import { ShieldService } from '../services/shield-service';

type ShieldHistoryListProps = {
  limit?: number;
};

export const ShieldHistoryList = ({ limit = 10 }: ShieldHistoryListProps) => {
  const [history, setHistory] = useState<ShieldUsageRecord[]>([]);

  useEffect(() => {
    void ShieldService.getUsageHistory(limit).then(setHistory);
  }, [limit]);

  if (history.length === 0) {
    return (
      <EmptyState
        icon="shield-outline"
        title="Nenhum escudo utilizado"
        description="Quando um escudo proteger sua sequência, o registro aparecerá aqui."
      />
    );
  }

  return (
    <Card elevated>
      <Text className="mb-4  font-semibold text-foreground">Histórico de uso</Text>
      <View className="gap-3">
        {history.map((entry) => (
          <View
            key={entry.id}
            className="rounded-xl border border-border bg-surface px-4 py-3">
            <Text className="text-sm font-medium capitalize text-foreground">
              {formatStudyDateLabel(entry.missedDate)}
            </Text>
            <Text className="mt-1 text-xs text-foreground-secondary">
              Sequência protegida: {entry.streakProtected} dias
            </Text>
            <Text className="mt-0.5 text-xs text-muted">
              Escudos restantes: {entry.shieldsRemaining}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
};
