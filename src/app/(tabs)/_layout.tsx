import { Tabs } from 'expo-router';
import { View } from 'react-native';

import { CelebrationsHost } from '@/components/celebration/CelebrationsHost';
import { AppTabBar } from '@/components/layout/AppTabBar';

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }} pointerEvents="box-none">
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          lazy: true,
          freezeOnBlur: true,
        }}>
        <Tabs.Screen name="index" options={{ title: 'Início' }} />
        <Tabs.Screen name="quests" options={{ title: 'Missões' }} />
        <Tabs.Screen name="inventory" options={{ title: 'Itens' }} />
        <Tabs.Screen name="shop" options={{ title: 'Loja' }} />
        <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      </Tabs>
      <CelebrationsHost />
    </View>
  );
}
