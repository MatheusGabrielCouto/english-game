import { Text, View } from 'react-native';

import { CityResourceType, type CityResourceBalances } from '@/types/city-resource';

import { CITY_RESOURCE_LABELS } from '../constants/city-resource-config';

type CityResourceStripProps = {
  balances: CityResourceBalances | null;
};

const ORDER = [
  CityResourceType.LEXICON_BRICK,
  CityResourceType.FLUENCY_CEMENT,
  CityResourceType.CONSISTENCY_WOOD,
] as const;

export const CityResourceStrip = ({ balances }: CityResourceStripProps) => {
  if (!balances) return null;

  return (
    <View className="flex-row flex-wrap gap-2">
      {ORDER.map((type) => {
        const meta = CITY_RESOURCE_LABELS[type];
        return (
          <View
            key={type}
            className="flex-row items-center gap-1 rounded-lg border border-border bg-surface-elevated px-2.5 py-1.5"
          >
            <Text className="text-sm">{meta.emoji}</Text>
            <Text className="text-xs font-semibold text-foreground">
              {balances[type]}
            </Text>
            <Text className="text-[10px] text-muted">{meta.shortLabel}</Text>
          </View>
        );
      })}
    </View>
  );
};
