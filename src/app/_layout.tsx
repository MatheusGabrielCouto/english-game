import { Platform } from 'react-native';
import 'react-native-gesture-handler';

if (Platform.OS === 'android') {
  require('@/widgets/android/register');
}

import '@/global.css';
import '@/nativewind-setup';
import '@/splash-bootstrap';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProviders } from '@/components/layout/AppProviders';
import { theme } from '@/constants';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProviders>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'default',
            freezeOnBlur: true,
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="pet" />
          <Stack.Screen name="city" />
          <Stack.Screen name="inventory" />
          <Stack.Screen name="loot-boxes" />
          <Stack.Screen name="profile" />
        </Stack>
        </AppProviders>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
