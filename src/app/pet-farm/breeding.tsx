import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetBreedingScreenContent } from '@/features/pet-farm/components/PetBreedingScreenContent';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';

export default function PetFarmBreedingRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={PET_FARM_UI.breedingTitle}
        subtitle="Combine casais e gere ovos na incubadora."
      />
      <View className="pt-2">
        <PetBreedingScreenContent />
      </View>
    </ScreenContainer>
  );
}
