import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmHallScreenContent } from '@/features/pet-farm/components/PetFarmHallScreenContent';
import { PET_HALL_UI } from '@/features/pet-farm/constants/pet-hall-ui';

export default function PetFarmHallRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title="Hall da Fama" subtitle={PET_HALL_UI.subtitle} />
      <View className="pt-2">
        <PetFarmHallScreenContent />
      </View>
    </ScreenContainer>
  );
}
