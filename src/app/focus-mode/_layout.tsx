import { Stack } from 'expo-router'

import { FeatureErrorBoundary } from '@/components/layout'

export default function FocusModeLayout() {
  return (
    <FeatureErrorBoundary feature="focus-mode">
      <Stack screenOptions={{ headerShown: false }} />
    </FeatureErrorBoundary>
  )
}
