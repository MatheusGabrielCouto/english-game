import { Text, View } from 'react-native';

import { GameDisplayText } from '@/components/ui/game';

import { CITY_UI } from '../constants/city-ui';

type CityHeroStatsProps = {
  unlocked: number;
  total: number;
  completionPercent: number;
  levelsUntilNext: number | null;
};

export const CityHeroStats = ({
  unlocked,
  total,
  completionPercent,
  levelsUntilNext,
}: CityHeroStatsProps) => (
  <View className="mt-4 gap-2">
    <View className="flex-row gap-2">
      <View className="min-h-[72px] flex-1 rounded-xl border border-accent/30 bg-accent/10 px-3 py-3">
        <Text className="text-[11px] font-semibold leading-4 text-foreground-secondary">
          {CITY_UI.statsBuiltLabel}
        </Text>
        <View className="mt-2 flex-row items-end gap-1">
          <GameDisplayText variant="hero" className="text-3xl leading-none text-accent">
            {unlocked}
          </GameDisplayText>
          <Text className="pb-0.5 text-base font-bold text-muted">/ {total}</Text>
        </View>
      </View>

      <View className="min-h-[72px] flex-1 rounded-xl border border-gold/30 bg-gold/10 px-3 py-3">
        <Text className="text-[11px] font-semibold leading-4 text-foreground-secondary">
          {CITY_UI.statsCityLabel}
        </Text>
        <GameDisplayText variant="hero" className="mt-2 text-3xl leading-none text-gold">
          {completionPercent}%
        </GameDisplayText>
      </View>
    </View>

    {levelsUntilNext !== null ? (
      <View className="flex-row items-center justify-between rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
        <Text className="text-xs text-foreground-secondary">{CITY_UI.statsNextLabel}</Text>
        <GameDisplayText variant="title" className="text-primary">
          {levelsUntilNext === 1 ? '1 nível' : `${levelsUntilNext} níveis`}
        </GameDisplayText>
      </View>
    ) : null}
  </View>
);
