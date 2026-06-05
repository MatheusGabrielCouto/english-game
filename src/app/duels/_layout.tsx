import { Stack } from 'expo-router';

import { FeatureErrorBoundary } from '@/components/layout';
import { DuelFeatureGate } from '@/features/duels/components/DuelFeatureGate';

export default function DuelsLayout() {
  return (
    <FeatureErrorBoundary feature="duels">
      <DuelFeatureGate>
        <Stack screenOptions={{ headerShown: false }} />
      </DuelFeatureGate>
    </FeatureErrorBoundary>
  );
}
