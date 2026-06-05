import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmAdventuresScreenContent } from '@/features/pet-farm/components/PetFarmAdventuresScreenContent';
import { PET_ADVENTURES_UI } from '@/features/pet-farm/constants/pet-adventures-ui';

export default function PetFarmAdventuresRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title="Aventuras" subtitle={PET_ADVENTURES_UI.subtitle} />
      <View className="pt-2">
        <PetFarmAdventuresScreenContent />
      </View>
    </ScreenContainer>
  );
}
