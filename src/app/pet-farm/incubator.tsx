import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmIncubatorScreenContent } from '@/features/pet-farm/components/PetFarmIncubatorScreenContent';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';
import { PET_INCUBATOR_UI } from '@/features/pet-farm/constants/pet-incubator-ui';

export default function PetFarmIncubatorRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_FARM_UI.incubator} subtitle={PET_INCUBATOR_UI.subtitle} />
      <View className="pt-2">
        <PetFarmIncubatorScreenContent />
      </View>
    </ScreenContainer>
  );
}
