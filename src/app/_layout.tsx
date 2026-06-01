import 'react-native-gesture-handler';

import '@/global.css';
import '@/nativewind-setup';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppProviders } from '@/components/layout/AppProviders';
import { theme } from '@/constants';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'simple_push',
            freezeOnBlur: true,
          }}
        />
      </AppProviders>
    </GestureHandlerRootView>
  );
}
