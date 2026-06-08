import { Stack } from 'expo-router'

import { FeatureErrorBoundary } from '@/components/layout'

export default function MotivationLayout() {
  return (
    <FeatureErrorBoundary feature="motivation-spark">
      <Stack screenOptions={{ headerShown: false }} />
    </FeatureErrorBoundary>
  )
}
