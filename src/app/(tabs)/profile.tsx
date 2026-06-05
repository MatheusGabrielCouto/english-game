import { FeatureErrorBoundary } from '@/components/layout'
import { ProfileScreen } from '@/features/profile'

export default function ProfileTabScreen() {
  return (
    <FeatureErrorBoundary feature="profile" showGoBack={false}>
      <ProfileScreen />
    </FeatureErrorBoundary>
  )
}
