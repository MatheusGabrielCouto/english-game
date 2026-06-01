import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { MetagameScreenContent } from './MetagameScreenContent';

export const MetagameScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title="Metagame"
      subtitle="Temporadas, coleções, prestígio e sua história"
      emoji="🏛️"
    />
    <View className="pt-2">
      <MetagameScreenContent />
    </View>
  </ScreenContainer>
);
