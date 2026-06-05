import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmBarnScreenContent } from '@/features/pet-farm/components/PetFarmBarnScreenContent';
import { PET_BARN_UI } from '@/features/pet-farm/constants/pet-barn-ui';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';

export default function PetFarmBarnRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_FARM_UI.barn} subtitle={PET_BARN_UI.subtitle} />
      <View className="pt-2">
        <PetFarmBarnScreenContent />
      </View>
    </ScreenContainer>
  );
}
