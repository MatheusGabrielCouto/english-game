import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import type { ShieldStatsRecord } from '@/types/shield';

import { ShieldService } from '../services/shield-service';

export const ShieldStatsCard = () => {
  const [stats, setStats] = useState<ShieldStatsRecord | null>(null);

  useEffect(() => {
    void ShieldService.getStats().then(setStats);
  }, []);

  if (!stats) return null;

  return (
    <Card elevated>
      <Text className="mb-1 text-base font-semibold text-foreground">Estatísticas</Text>
      <Text className="mb-4 text-sm text-foreground-secondary">
        Resumo do uso e conquista de escudos
      </Text>
      <View className="flex-row flex-wrap gap-3">
        <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-xs text-foreground-secondary">Escudos ganhos</Text>
          <Text className="mt-1 text-xl font-bold text-success">{stats.totalEarned}</Text>
        </View>
        <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-xs text-foreground-secondary">Escudos usados</Text>
          <Text className="mt-1 text-xl font-bold text-foreground">{stats.totalConsumed}</Text>
        </View>
        <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-xs text-foreground-secondary">Sequências salvas</Text>
          <Text className="mt-1 text-xl font-bold text-accent">{stats.totalStreaksProtected}</Text>
        </View>
        <View className="min-w-[46%] flex-1 rounded-xl border border-border bg-surface px-4 py-3">
          <Text className="text-xs text-foreground-secondary">Maior sequência protegida</Text>
          <Text className="mt-1 text-xl font-bold text-warning">
            {stats.longestProtectedStreak}
          </Text>
        </View>
      </View>
    </Card>
  );
};
