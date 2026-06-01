import { ScrollView, Text, View } from 'react-native';

import { usePunishmentStore } from '@/features/punishments/store/punishment-store';
import type { CityBuildingViewModel } from '@/types/city';
import { cn } from '@/utils';

import { CITY_UI } from '../constants/city-ui';

type CitySkylineProps = {
  buildings: CityBuildingViewModel[];
};

const SKYLINE_SLOT_WIDTH = 72;

export const CitySkyline = ({ buildings }: CitySkylineProps) => {
  const cityVibrancy = usePunishmentStore((state) => state.aggregated.cityVibrancy);
  const dimmed = cityVibrancy < 100;
  const unlockedCount = buildings.filter((b) => b.unlockedAt !== null).length;

  return (
    <View className="overflow-hidden rounded-game border border-border bg-surface-elevated">
      <View className="border-b border-border/80 px-4 py-3">
        <Text className="text-sm font-semibold text-foreground">
          {CITY_UI.skylineBuilt(unlockedCount, buildings.length)}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="px-3 py-5 gap-2"
        accessibilityLabel="Horizonte da cidade com construções desbloqueadas e bloqueadas">
        {buildings.map((building) => {
          const isUnlocked = building.unlockedAt !== null;

          return (
            <View
              key={building.key}
              style={{ width: SKYLINE_SLOT_WIDTH }}
              className={cn(
                'items-center gap-2 rounded-xl px-1 py-2',
                building.isActive && 'bg-primary/15',
                !isUnlocked && 'opacity-40',
              )}
              accessibilityLabel={`${building.name}${isUnlocked ? ', desbloqueado' : `, bloqueado, nível ${building.requiredLevel}`}`}>
              <Text className="text-2xl">{isUnlocked ? building.icon : '🔒'}</Text>
              <View
                className={cn(
                  'w-12 rounded-t-lg',
                  isUnlocked ? (dimmed ? 'bg-primary/40' : 'bg-primary/75') : 'bg-border',
                  building.isActive ? 'h-16' : isUnlocked ? 'h-11' : 'h-7',
                )}
              />
              <Text
                className={cn(
                  'text-center text-[9px] font-semibold leading-3',
                  building.isActive ? 'text-primary' : 'text-foreground-secondary',
                )}
                numberOfLines={2}>
                {building.name}
              </Text>
              {building.isActive ? (
                <View className="rounded-full bg-primary/25 px-2 py-0.5">
                  <Text className="text-[8px] font-bold uppercase text-primary">Atual</Text>
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <View className="h-2 bg-border/60" />
      <View className="h-2.5 rounded-b-game bg-border" accessibilityLabel="Base da cidade" />
    </View>
  );
};
