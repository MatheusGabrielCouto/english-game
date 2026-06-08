import { Text, View } from 'react-native';

import type { CityMapSummary } from '@/types/city-map';
import type { CityResourceBalances } from '@/types/city-resource';

import { CITY_UI } from '../constants/city-ui';
import { CityResourceStrip } from './CityResourceStrip';

type CityMapHeaderProps = {
  summary: CityMapSummary;
  resourceBalances?: CityResourceBalances | null;
};

export const CityMapHeader = ({ summary, resourceBalances }: CityMapHeaderProps) => (
  <View className="gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
    <View className="flex-row items-center justify-between gap-3">
      <View className="flex-1">
        <Text className="text-lg font-bold text-foreground">{summary.cityName}</Text>
        <Text className="mt-0.5 text-xs text-foreground-secondary">
          {CITY_UI.mapPlacesUnlocked(summary.unlockedPoiCount, summary.totalPoiCount)}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-xs text-muted">{CITY_UI.mapVitalityLabel}</Text>
        <Text className=" font-semibold text-foreground">{summary.cityVitality}%</Text>
        <Text className="text-[10px] text-muted">
          {summary.vitalityBand === 'high'
            ? CITY_UI.vitalityHigh
            : summary.vitalityBand === 'low'
              ? CITY_UI.vitalityLow
              : CITY_UI.vitalityMid}
        </Text>
      </View>
    </View>
    {resourceBalances ? (
      <View className="gap-1.5 border-t border-border/60 pt-3">
        <Text className="text-[10px] font-bold uppercase tracking-wider text-muted">
          {CITY_UI.mapResourcesLabel}
        </Text>
        <CityResourceStrip balances={resourceBalances} />
      </View>
    ) : null}
  </View>
);
