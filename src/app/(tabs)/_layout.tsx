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
        <Tabs.Screen name="play" options={{ title: 'Jogar' }} />
        <Tabs.Screen name="quests" options={{ href: null }} />
        <Tabs.Screen name="knowledge" options={{ title: 'Knowledge' }} />
        <Tabs.Screen name="menu" options={{ title: 'Menu' }} />
        <Tabs.Screen name="profile" options={{ title: 'Perfil' }} />
      </Tabs>
      <CelebrationsHost />
    </View>
  );
}
