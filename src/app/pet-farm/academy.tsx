import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';
import { PetFarmAcademyScreenContent } from '@/features/pet-farm/components/PetFarmAcademyScreenContent';
import { PET_ACADEMY_UI } from '@/features/pet-farm/constants/pet-academy-ui';

export default function PetFarmAcademyRoute() {
  return (
    <ScreenContainer scrollable>
      <ScreenHeader showBack title="Academia dos Pets" subtitle={PET_ACADEMY_UI.subtitle} />
      <View className="pt-2">
        <PetFarmAcademyScreenContent />
      </View>
    </ScreenContainer>
  );
}
