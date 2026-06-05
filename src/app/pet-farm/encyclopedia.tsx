import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetBreedingEncyclopediaScreenContent } from '@/features/pet-farm/components/PetBreedingEncyclopediaScreenContent';
import { PET_ENCYCLOPEDIA_UI } from '@/features/pet-farm/constants/pet-encyclopedia-ui';
import { PET_FARM_UI } from '@/features/pet-farm/constants/pet-farm-ui';

export default function PetFarmEncyclopediaRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader
        showBack
        title={PET_FARM_UI.encyclopediaTitle}
        subtitle={PET_ENCYCLOPEDIA_UI.subtitle}
      />
      <View className="pt-2">
        <PetBreedingEncyclopediaScreenContent />
      </View>
    </ScreenContainer>
  );
}
