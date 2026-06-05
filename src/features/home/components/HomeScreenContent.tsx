import { useEffect } from 'react'
import { View } from 'react-native'

import { StartupPerfService } from '@/services/startup-perf-service'

import { HomeChangelogCard } from '@/features/changelog/components/HomeChangelogCard'
import { HomeActiveObjectivesCard } from '@/features/home/components/HomeActiveObjectivesCard'
import { HomeCityCard } from '@/features/home/components/HomeCityCard'
import { HomeDailyProgressCard } from '@/features/home/components/HomeDailyProgressCard'
import { HomeDoNowCard } from '@/features/home/components/HomeDoNowCard'
import { HomeEventsCard } from '@/features/home/components/HomeEventsCard'
import { HomeExploreFooter } from '@/features/home/components/HomeExploreFooter'
import { HomeNextRewardCard } from '@/features/home/components/HomeNextRewardCard'
import { HomePetCompanionCard } from '@/features/home/components/HomePetCompanionCard'
import { HomePlayerHeader } from '@/features/home/components/HomePlayerHeader'
import { HomeQuickActionsCard } from '@/features/home/components/HomeQuickActionsCard'
import { HomeScreenSkeleton } from '@/features/home/components/HomeScreenSkeleton'
import { HomeStreakCard } from '@/features/home/components/HomeStreakCard'
import { HomeZoneSection } from '@/features/home/components/shared/HomeZoneSection'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { useHomeFocusRefresh } from '@/features/home/hooks/use-home-focus-refresh'
import { useHomeScreenReady } from '@/features/home/hooks/use-home-screen-ready'
import { CoachMarkTarget } from '@/features/tutorial'

export const HomeScreenContent = () => {
  const isReady = useHomeScreenReady()
  useHomeFocusRefresh()

  useEffect(() => {
    if (!isReady) return
    StartupPerfService.mark('home_interactive')
  }, [isReady])

  if (!isReady) {
    return <HomeScreenSkeleton />
  }

  return (
    <View className="w-full gap-6 pb-4">
      <HomeZoneSection
        emoji={HOME_UI.zones.now.emoji}
        title={HOME_UI.zones.now.title}
        subtitle={HOME_UI.zones.now.subtitle}>
        <HomePlayerHeader />
        <HomeChangelogCard />
        <CoachMarkTarget coachKey="home-do-now">
          <HomeDoNowCard />
        </CoachMarkTarget>
        <HomeStreakCard />
        <HomeActiveObjectivesCard />
      </HomeZoneSection>

      <HomeZoneSection
        emoji={HOME_UI.zones.progress.emoji}
        title={HOME_UI.zones.progress.title}
        subtitle={HOME_UI.zones.progress.subtitle}>
        <HomeDailyProgressCard />
        <HomeNextRewardCard />
      </HomeZoneSection>

      <HomeZoneSection
        emoji={HOME_UI.zones.explore.emoji}
        title={HOME_UI.zones.explore.title}
        subtitle={HOME_UI.zones.explore.subtitle}>
        <HomePetCompanionCard />
        <HomeCityCard />
        <HomeEventsCard />
        <HomeQuickActionsCard />
        <HomeExploreFooter />
      </HomeZoneSection>
    </View>
  )
}
