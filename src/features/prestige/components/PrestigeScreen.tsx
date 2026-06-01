import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { PrestigeScreenContent } from './PrestigeScreenContent';

export const PrestigeScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title="Ascensão"
      subtitle="Sacrifício da run atual · poder permanente"
      emoji="⭐"
    />
    <View className="pt-2">
      <PrestigeScreenContent />
    </View>
  </ScreenContainer>
);
