import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { PressableScale } from '@/components/ui/game';
import type { CitySummary } from '@/types/city';

import { BUILDINGS_BY_KEY } from '../constants/default-buildings';

type CityPreviewCardProps = {
  summary: CitySummary;
  onPress: () => void;
};

export const CityPreviewCard = ({ summary, onPress }: CityPreviewCardProps) => {
  const currentBuilding = BUILDINGS_BY_KEY[summary.currentBuildingKey];
  const progress = summary.total > 0 ? Math.round((summary.unlocked / summary.total) * 100) : 0;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Ver cidade internacional">
      <Card elevated accent className="border-accent/35">
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">🏙️ Cidade</Text>
        <View className="mt-2 flex-row items-center gap-3">
          <View className="rounded-xl border border-accent/30 bg-accent/10 p-3">
            <Text className="text-4xl">{currentBuilding?.icon ?? '🏠'}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-black text-foreground">
              {currentBuilding?.name ?? 'House'}
            </Text>
            <Text className="mt-1 text-xs text-foreground-secondary">
              {summary.unlocked} de {summary.total} marcos construídos
            </Text>
          </View>
        </View>
        <View className="mt-3">
          <ProgressBar value={progress} variant="default" height="sm" />
        </View>
      </Card>
    </PressableScale>
  );
};
