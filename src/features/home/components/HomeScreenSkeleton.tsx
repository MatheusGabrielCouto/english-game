import { View } from 'react-native'

import { HomeCardSkeleton } from './HomeCardSkeleton'

export const HomeScreenSkeleton = () => (
  <View className="gap-4">
    <HomeCardSkeleton variant="hero" />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton variant="row" />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
  </View>
)
