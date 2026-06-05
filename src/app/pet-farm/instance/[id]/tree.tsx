import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetLineageTreeScreenContent } from '@/features/pet-farm/components/PetLineageTreeScreenContent';
import { PET_GEN_UI } from '@/features/pet-farm/constants/pet-gen-ui';

export default function PetFarmInstanceTreeRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const instanceId = Number(id);

  if (!Number.isFinite(instanceId)) {
    return null;
  }

  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_GEN_UI.treeTitle} />
      <View className="pt-2">
        <PetLineageTreeScreenContent instanceId={instanceId} />
      </View>
    </ScreenContainer>
  );
};
