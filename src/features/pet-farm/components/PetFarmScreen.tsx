import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { PetFarmScreenContent } from './PetFarmScreenContent';

export const PetFarmScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader showBack title={PET_FARM_UI.title} subtitle={PET_FARM_UI.subtitle} />
    <View className="pt-2">
      <PetFarmScreenContent />
    </View>
  </ScreenContainer>
);
