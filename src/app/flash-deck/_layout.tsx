import { Stack } from 'expo-router';

import { FlashDeckFeatureGate } from '@/features/flash-deck/components/FlashDeckFeatureGate';

export default function FlashDeckLayout() {
  return (
    <FlashDeckFeatureGate>
      <Stack screenOptions={{ headerShown: false }} />
    </FlashDeckFeatureGate>
  );
}
