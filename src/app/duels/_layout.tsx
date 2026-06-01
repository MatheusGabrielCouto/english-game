import { Stack } from 'expo-router';

import { DuelFeatureGate } from '@/features/duels/components/DuelFeatureGate';

export default function DuelsLayout() {
  return (
    <DuelFeatureGate>
      <Stack screenOptions={{ headerShown: false }} />
    </DuelFeatureGate>
  );
}
