import { View } from 'react-native'

import { GameCard } from '@/components/ui/game'

import { HomeCardSkeleton } from './HomeCardSkeleton'

export const HomeScreenSkeleton = () => (
  <View className="gap-5">
    <HomeCardSkeleton variant="hero" />
    <HomeCardSkeleton variant="row" />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <HomeCardSkeleton />
    <GameCard variant="quest">
      <View className="h-3 w-24 rounded bg-surface-elevated" />
      <View className="mt-3 flex-row flex-wrap gap-2">
        {Array.from({ length: 8 }, (_, index) => (
          <HomeCardSkeleton key={index} variant="compact" className="w-[31.5%]" />
        ))}
      </View>
    </GameCard>
    <HomeCardSkeleton />
  </View>
)
