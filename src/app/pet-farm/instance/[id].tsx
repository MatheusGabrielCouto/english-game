import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetInstanceDetailScreenContent } from '@/features/pet-farm/components/PetInstanceDetailScreenContent';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';

const DETAIL_SUBTITLE = 'Hub do pet';

export default function PetFarmInstanceRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const instanceId = Number(id);

  if (!Number.isFinite(instanceId)) {
    return null;
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_FARM_UI.detailTitle} subtitle={DETAIL_SUBTITLE} />
      <View className="pt-2">
        <PetInstanceDetailScreenContent instanceId={instanceId} />
      </View>
    </ScreenContainer>
  );
}
