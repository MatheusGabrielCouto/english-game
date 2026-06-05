import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmMapScreen } from '@/features/pet-farm/components/PetFarmMapScreen';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';

export default function PetFarmMapRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_FARM_UI.title} subtitle={PET_FARM_UI.mapTitle} />
      <View className="pt-2">
        <PetFarmMapScreen />
      </View>
    </ScreenContainer>
  );
}
