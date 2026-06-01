import { Text, View } from 'react-native';

import type { CityRumorViewModel } from '@/types/city-map';

import { CITY_UI } from '../constants/city-ui';

type CityRumorBannerProps = {
  rumor: CityRumorViewModel | null;
  vitalityBand: 'low' | 'mid' | 'high';
};

const bandStyles = {
  low: 'border-warning/40 bg-warning/10',
  mid: 'border-border bg-surface-elevated',
  high: 'border-success/30 bg-success/10',
} as const;

export const CityRumorBanner = ({ rumor, vitalityBand }: CityRumorBannerProps) => {
  if (!rumor) return null;

  return (
    <View className={`rounded-2xl border px-4 py-3 ${bandStyles[vitalityBand]}`}>
      <Text className="text-xs font-bold uppercase tracking-wider text-muted">
        {CITY_UI.cityRumorLabel}
      </Text>
      <Text className="mt-1 text-sm leading-5 text-foreground">{rumor.message}</Text>
    </View>
  );
};
