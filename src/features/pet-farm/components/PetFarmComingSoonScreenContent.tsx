import { Text, View } from 'react-native';

import { Card } from '@/components';

import { PET_FARM_MAP_UI } from '../constants/pet-farm-map-ui';

type PetFarmComingSoonScreenContentProps = {
  featureLabel: string;
  emoji: string;
};

export const PetFarmComingSoonScreenContent = ({
  featureLabel,
  emoji,
}: PetFarmComingSoonScreenContentProps) => (
  <View className="gap-4 pb-8">
    <Card className="items-center gap-4 py-10">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="text-lg font-black text-foreground">{featureLabel}</Text>
      <Text className="text-center text-sm font-bold text-primary">{PET_FARM_MAP_UI.comingSoonTitle}</Text>
      <Text className="max-w-xs text-center text-xs leading-relaxed text-muted">
        {PET_FARM_MAP_UI.comingSoonBody}
      </Text>
    </Card>
  </View>
);
