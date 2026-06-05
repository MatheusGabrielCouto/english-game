import { Redirect } from 'expo-router'

import { FeatureErrorBoundary } from '@/components/layout'
import { routes } from '@/constants'

export default function QuestsTabRedirect() {
  return (
    <FeatureErrorBoundary feature="quests" showGoBack={false}>
      <Redirect href={routes.tabs.play} />
    </FeatureErrorBoundary>
  )
}
