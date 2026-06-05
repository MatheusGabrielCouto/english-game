import { Stack } from 'expo-router';

import { FeatureErrorBoundary } from '@/components/layout';
import { FlashDeckFeatureGate } from '@/features/flash-deck/components/FlashDeckFeatureGate';

export default function FlashDeckLayout() {
  return (
    <FeatureErrorBoundary feature="flash-deck">
      <FlashDeckFeatureGate>
        <Stack screenOptions={{ headerShown: false }} />
      </FlashDeckFeatureGate>
    </FeatureErrorBoundary>
  );
}
