import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { FarmScreenContent } from './FarmScreenContent';

export const FarmScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader showBack title="Farm Infinito" subtitle="Estude além das missões diárias" emoji="🌾" />
    <View className="pt-2">
      <FarmScreenContent />
    </View>
  </ScreenContainer>
);
