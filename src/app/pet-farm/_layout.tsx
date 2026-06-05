import { Stack } from 'expo-router'

import { FeatureErrorBoundary } from '@/components/layout'

export default function PetFarmLayout() {
  return (
    <FeatureErrorBoundary feature="pet-farm">
      <Stack screenOptions={{ headerShown: false }} />
    </FeatureErrorBoundary>
  )
}
