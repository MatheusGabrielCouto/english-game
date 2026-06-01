import { View } from 'react-native';

import { ScreenContainer, ScreenHeader } from '@/components/layout';

import { LootBoxCatalogHub } from './LootBoxCatalogHub';

export const LootBoxCatalogScreen = () => (
  <ScreenContainer scrollable>
    <ScreenHeader
      showBack
      title="Catálogo de Loot Boxes"
      subtitle="Veja tudo o que pode obter antes de abrir"
      emoji="📋"
    />
    <View className="pt-2">
      <LootBoxCatalogHub />
    </View>
  </ScreenContainer>
);
