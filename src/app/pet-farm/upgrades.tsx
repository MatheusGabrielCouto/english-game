import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmUpgradesScreenContent } from '@/features/pet-farm/components/PetFarmUpgradesScreenContent';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';

export default function PetFarmUpgradesRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_FARM_UI.upgradesTitle} />
      <View className="pt-2">
        <PetFarmUpgradesScreenContent />
      </View>
    </ScreenContainer>
  );
}
