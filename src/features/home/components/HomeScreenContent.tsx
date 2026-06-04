import { View } from 'react-native'

import { HomeActiveContractCard } from '@/features/home/components/HomeActiveContractCard'
import { HomeCityCard } from '@/features/home/components/HomeCityCard'
import { HomeDailyProgressCard } from '@/features/home/components/HomeDailyProgressCard'
import { HomeDailyQuestsCard } from '@/features/home/components/HomeDailyQuestsCard'
import { HomeEventsCard } from '@/features/home/components/HomeEventsCard'
import { HomeKnowledgeVaultCard } from '@/features/home/components/HomeKnowledgeVaultCard'
import { HomeNextRewardCard } from '@/features/home/components/HomeNextRewardCard'
import { HomePetCompanionCard } from '@/features/home/components/HomePetCompanionCard'
import { HomePlayerHeader } from '@/features/home/components/HomePlayerHeader'
import { HomeQuickActionsCard } from '@/features/home/components/HomeQuickActionsCard'
import { HomeRoutinesCard } from '@/features/home/components/HomeRoutinesCard'
import { HomeScreenSkeleton } from '@/features/home/components/HomeScreenSkeleton'
import { HomeStreakCard } from '@/features/home/components/HomeStreakCard'
import { useHomeFocusRefresh } from '@/features/home/hooks/use-home-focus-refresh'
import { useHomeScreenReady } from '@/features/home/hooks/use-home-screen-ready'

export const HomeScreenContent = () => {
  const isReady = useHomeScreenReady()
  useHomeFocusRefresh()

  if (!isReady) {
    return <HomeScreenSkeleton />
  }

  return (
    <View className="w-full gap-4 pb-4">
      <HomePlayerHeader />
      <HomeQuickActionsCard />
      <HomeStreakCard />
      <HomePetCompanionCard />
      <HomeDailyProgressCard />
      <HomeDailyQuestsCard />
      <HomeRoutinesCard />
      <HomeActiveContractCard />
      <HomeKnowledgeVaultCard />
      <HomeCityCard />
      <HomeNextRewardCard />
      <HomeEventsCard />
    </View>
  )
}
