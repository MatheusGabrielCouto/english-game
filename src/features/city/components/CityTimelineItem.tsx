import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import { TITLES_BY_KEY } from '@/features/titles/constants/default-titles';
import type { CityBuildingViewModel } from '@/types/city';
import { cn } from '@/utils';

import { CITY_UI } from '../constants/city-ui';

type CityTimelineItemProps = {
  building: CityBuildingViewModel;
  playerLevel: number;
  isLast?: boolean;
};

const formatUnlockDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const CityTimelineItem = ({ building, playerLevel, isLast = false }: CityTimelineItemProps) => {
  const isUnlocked = building.unlockedAt !== null;
  const isReachable = playerLevel >= building.requiredLevel;
  const levelsUntil = Math.max(0, building.requiredLevel - playerLevel);
  const linkedTitle = TITLES_BY_KEY[building.linkedTitleKey]?.name;
  const levelProgress =
    building.requiredLevel > 0
      ? Math.min(100, Math.round((playerLevel / building.requiredLevel) * 100))
      : 100;

  const statusLabel = building.isActive
    ? CITY_UI.statusActive
    : isUnlocked
      ? CITY_UI.statusBuilt
      : CITY_UI.statusLocked;

  const statusTone = building.isActive ? 'primary' : isUnlocked ? 'success' : 'muted';

  return (
    <View className="flex-row gap-3">
      <View className="items-center">
        <View
          className={cn(
            'h-3 w-3 rounded-full border-2',
            building.isActive && 'border-primary bg-primary',
            isUnlocked && !building.isActive && 'border-success bg-success',
            !isUnlocked && 'border-border bg-surface',
          )}
        />
        {!isLast ? <View className="mt-1 w-0.5 flex-1 min-h-[48px] bg-border" /> : null}
      </View>

      <View
        className={cn(
          'mb-3 flex-1 rounded-xl border px-4 py-3',
          building.isActive && 'border-primary/45 bg-primary/10',
          isUnlocked && !building.isActive && 'border-border bg-surface',
          !isUnlocked && 'border-border/80 bg-surface/60 opacity-90',
        )}>
        <View className="flex-row items-start gap-3">
          <View
            className={cn(
              'rounded-xl border px-2.5 py-2',
              building.isActive && 'border-primary/30 bg-primary/15',
              isUnlocked && !building.isActive && 'border-success/25 bg-success/10',
              !isUnlocked && 'border-border bg-surface-elevated',
            )}>
            <Text className="text-2xl">{isUnlocked ? building.icon : '🔒'}</Text>
          </View>

          <View className="flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className=" font-black text-foreground">{building.name}</Text>
              <View
                className={cn(
                  'rounded-md px-2 py-0.5',
                  statusTone === 'primary' && 'bg-primary/20',
                  statusTone === 'success' && 'bg-success/15',
                  statusTone === 'muted' && 'bg-surface-elevated',
                )}>
                <Text
                  className={cn(
                    'text-[10px] font-bold uppercase',
                    statusTone === 'primary' && 'text-primary',
                    statusTone === 'success' && 'text-success',
                    statusTone === 'muted' && 'text-muted',
                  )}>
                  {statusLabel}
                </Text>
              </View>
            </View>

            <Text className="mt-1 text-xs leading-5 text-foreground-secondary" numberOfLines={2}>
              {building.description}
            </Text>

            <Text className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
              Nível {building.requiredLevel}
              {linkedTitle ? ` · Título: ${linkedTitle}` : ''}
            </Text>

            {isUnlocked && building.unlockedAt ? (
              <Text className="mt-1 text-[10px] font-medium text-accent">
                Construído em {formatUnlockDate(building.unlockedAt)}
              </Text>
            ) : null}

            {!isUnlocked ? (
              <View className="mt-3 gap-1">
                <Text className="text-[10px] text-foreground-secondary">
                  {isReachable
                    ? 'Nível atingido — construção pendente'
                    : CITY_UI.levelsRemaining(levelsUntil)}
                </Text>
                <ProgressBar value={levelProgress} max={100} variant="xp" height="sm" />
              </View>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
};
