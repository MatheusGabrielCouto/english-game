import { FeatureErrorBoundary } from '@/components/layout'
import { MenuHubScreen } from '@/features/menu-hub'

export default function MenuTabScreen() {
  return (
    <FeatureErrorBoundary feature="menu" showGoBack={false}>
      <MenuHubScreen />
    </FeatureErrorBoundary>
  )
}
