import { Text, View } from 'react-native';

import { PET_STAT_LABELS } from '../catalogs/pet-stat-rules';
import { PET_STAT_KEYS, type PetInstanceStats } from '@/types/pet-instance';

type PetStatBarsProps = {
  stats: PetInstanceStats;
  cap?: number;
};

export const PetStatBars = ({ stats, cap = 90 }: PetStatBarsProps) => (
  <View className="gap-2">
    {PET_STAT_KEYS.map((key) => {
      const value = stats[key];
      const pct = Math.min(100, Math.round((value / cap) * 100));
      return (
        <View key={key}>
          <View className="mb-1 flex-row justify-between">
            <Text className="text-xs text-muted">{PET_STAT_LABELS[key]}</Text>
            <Text className="text-xs font-bold text-foreground">{value}</Text>
          </View>
          <View className="h-2 overflow-hidden rounded-full bg-surface">
            <View className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </View>
        </View>
      );
    })}
  </View>
);
