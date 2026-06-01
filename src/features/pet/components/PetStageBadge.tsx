import { Text, View } from 'react-native';

import type { PetStageValue } from '@/types/pet';
import { STAGE_CONFIG } from '../constants';

type PetStageBadgeProps = {
  stage: PetStageValue;
};

export const PetStageBadge = ({ stage }: PetStageBadgeProps) => {
  const config = STAGE_CONFIG[stage];

  return (
    <View className="rounded-md bg-primary/25 px-2 py-0.5">
      <Text className="text-xs font-semibold text-primary">{config.label}</Text>
    </View>
  );
};
