import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmPastureScreenContent } from '@/features/pet-farm/components/PetFarmPastureScreenContent';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';
import { PET_PASTURE_UI } from '@/features/pet-farm/constants/pet-pasture-ui';

export default function PetFarmPastureRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_FARM_UI.pasture} subtitle={PET_PASTURE_UI.subtitle} />
      <View className="pt-2">
        <PetFarmPastureScreenContent />
      </View>
    </ScreenContainer>
  );
}
