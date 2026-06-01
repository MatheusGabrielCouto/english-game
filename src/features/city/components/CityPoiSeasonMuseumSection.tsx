import { Text, View } from 'react-native';

import { useMetagameStore } from '@/features/metagame/store/metagame-store';

import { CITY_UI } from '../constants/city-ui';

export const CityPoiSeasonMuseumSection = () => {
  const state = useMetagameStore((s) => s.state);
  const claimedCount = state?.seasonClaimedTiers.length ?? 0;
  const seasonPoints = state?.seasonPoints ?? 0;

  return (
    <View className="gap-3 rounded-2xl border border-border bg-surface p-4">
      <Text className="text-sm font-semibold text-foreground">{CITY_UI.museumTitle}</Text>
      <Text className="text-xs leading-5 text-foreground-secondary">{CITY_UI.museumHint}</Text>

      <View className="flex-row flex-wrap gap-3">
        <View className="rounded-xl border border-border bg-surface-elevated px-3 py-2">
          <Text className="text-xs text-muted">{CITY_UI.museumSeasonPoints}</Text>
          <Text className="text-lg font-bold text-primary">{seasonPoints}</Text>
        </View>
        <View className="rounded-xl border border-border bg-surface-elevated px-3 py-2">
          <Text className="text-xs text-muted">{CITY_UI.museumTiersClaimed}</Text>
          <Text className="text-lg font-bold text-foreground">{claimedCount}</Text>
        </View>
      </View>

      <Text className="text-xs leading-5 text-foreground-secondary">{CITY_UI.museumFooter}</Text>
    </View>
  );
};
