import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetGlossaryScreenContent } from '@/features/pet-farm/components/PetGlossaryScreenContent';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';

export default function PetFarmGlossaryRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title={PET_FARM_UI.glossaryTitle} subtitle="Dex de espécies" />
      <View className="pt-2">
        <PetGlossaryScreenContent />
      </View>
    </ScreenContainer>
  );
}
