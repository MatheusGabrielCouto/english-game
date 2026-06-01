import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { CareerScreenContent } from './CareerScreenContent';

export const CareerScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title="Carreira Internacional"
      subtitle="Jornada profissional, entrevistas e sonhos"
      emoji="💼"
    />
    <View className="pt-2">
      <CareerScreenContent />
    </View>
  </ScreenContainer>
);
