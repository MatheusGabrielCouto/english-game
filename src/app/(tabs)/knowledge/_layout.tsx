import { Stack } from 'expo-router'

import { FeatureErrorBoundary } from '@/components/layout'

export default function KnowledgeTabLayout() {
  return (
    <FeatureErrorBoundary feature="knowledge">
      <Stack screenOptions={{ headerShown: false }} />
    </FeatureErrorBoundary>
  )
}
