import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { LootBoxScreenContent } from './LootBoxScreenContent';

export const LootBoxScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title="Loot Boxes"
      subtitle="Abra caixas e descubra recompensas"
    />
    <View className="pt-2">
      <LootBoxScreenContent />
    </View>
  </ScreenContainer>
);
