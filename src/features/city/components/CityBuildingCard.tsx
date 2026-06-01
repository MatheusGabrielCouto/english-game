import { Text, View } from 'react-native';

import { Card } from '@/components';
import { TITLES_BY_KEY } from '@/features/titles/constants/default-titles';
import type { CityBuildingViewModel } from '@/types/city';

type CityBuildingCardProps = {
  building: CityBuildingViewModel;
};

const formatUnlockDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const CityBuildingCard = ({ building }: CityBuildingCardProps) => {
  const isUnlocked = building.unlockedAt !== null;
  const linkedTitle = TITLES_BY_KEY[building.linkedTitleKey]?.name;

  return (
    <Card className={building.isActive ? 'border-primary/40' : undefined}>
      <View className="flex-row items-start gap-3">
        <Text className="text-3xl">{isUnlocked ? building.icon : '🔒'}</Text>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-base font-semibold text-foreground">{building.name}</Text>
            {building.isActive ? (
              <Text className="text-xs font-medium text-primary">Atual</Text>
            ) : null}
          </View>
          <Text className="text-sm text-foreground-secondary">{building.description}</Text>
          <Text className="text-xs text-foreground-secondary">Nível {building.requiredLevel}</Text>
          {linkedTitle ? (
            <Text className="text-xs text-foreground-secondary">Título vinculado: {linkedTitle}</Text>
          ) : null}
          {isUnlocked && building.unlockedAt ? (
            <Text className="text-xs text-accent">
              Desbloqueado em {formatUnlockDate(building.unlockedAt)}
            </Text>
          ) : (
            <Text className="text-xs text-foreground-secondary">Ainda não construído</Text>
          )}
        </View>
      </View>
    </Card>
  );
};
