import { View } from 'react-native'

import { ProfileExploreGrid } from './ProfileExploreGrid'
import { ProfileIdentityHero } from './ProfileIdentityHero'
import { ProfileQuickStats } from './ProfileQuickStats'

type ProfileIdentityTabContentProps = {
  onEditName: () => void
}

export const ProfileIdentityTabContent = ({ onEditName }: ProfileIdentityTabContentProps) => (
  <View className="gap-4">
    <ProfileIdentityHero onEditName={onEditName} />
    <ProfileQuickStats />
    <ProfileExploreGrid />
  </View>
)
