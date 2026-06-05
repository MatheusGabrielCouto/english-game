import { type Href, router } from 'expo-router'
import { useEffect } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { routes } from '@/constants'
import {
    CATEGORY_ICONS,
    type MissionCategoryValue,
} from '@/features/game-design/constants/mission-types'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { useHomeDoNow } from '@/features/home/hooks/use-home-do-now'
const getMissionEmoji = (category?: string) => {
  if (!category) return '🎯'
  const key = category as MissionCategoryValue
  return CATEGORY_ICONS[key] ?? '🎯'
}

export const HomeDoNowCard = () => {
  const {
    nextMission,
    pendingCount,
    missionCount,
    allDone,
    hasHydrated,
    isSyncing,
    ensureDailyMissions,
  } = useHomeDoNow()

  useEffect(() => {
    ensureDailyMissions()
  }, [ensureDailyMissions])

  const handleOpenQuests = () => {
    router.push(routes.tabs.play as Href)
  }

  if (!hasHydrated || isSyncing) {
    return <HomeCardSkeleton />
  }

  if (allDone) {
    return (
      <GameCard variant="reward" glow className="border-gold/40">
        <HomeSectionLabel emoji="🎉" title={HOME_UI.doNow.allDoneTitle} tone="gold" />
        <Text className="mt-3 text-sm leading-5 text-foreground-secondary">
          {HOME_UI.doNow.allDoneBody(missionCount)}
        </Text>
        <View className="mt-5">
          <Button label={HOME_UI.doNow.viewQuests} size="lg" onPress={handleOpenQuests} />
        </View>
      </GameCard>
    )
  }

  if (!nextMission) {
    return (
      <GameCard variant="hero" className="border-primary/30">
        <HomeSectionLabel emoji="⚡" title={HOME_UI.doNow.title} tone="primary" />
        <Text className="mt-3 text-sm text-foreground-secondary">{HOME_UI.doNow.empty}</Text>
        <View className="mt-5">
          <Button label={HOME_UI.doNow.viewQuests} size="lg" onPress={handleOpenQuests} />
        </View>
      </GameCard>
    )
  }

  const missionEmoji = getMissionEmoji(nextMission.category)

  return (
    <GameCard variant="hero" glow className="border-primary/50">
      <HomeSectionLabel
        emoji="⚡"
        title={HOME_UI.doNow.title}
        subtitle={HOME_UI.doNow.missionHint(pendingCount)}
        tone="primary"
      />

      <View className="mt-4 flex-row items-start gap-3">
        <View className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
          <Text className="text-2xl">{missionEmoji}</Text>
        </View>
        <View className={HOME_LAYOUT.growBlock}>
          <Text className="text-lg font-black leading-6 text-foreground" numberOfLines={2}>
            {nextMission.title}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-foreground-secondary" numberOfLines={2}>
            {nextMission.description}
          </Text>
          <Text className="mt-2 text-sm font-bold text-xp">
            {HOME_UI.doNow.rewardLine(nextMission.xpReward, nextMission.coinReward)}
          </Text>
        </View>
      </View>

      <View className="mt-5">
        <Button
          label={HOME_UI.doNow.cta}
          size="lg"
          onPress={handleOpenQuests}
          accessibilityLabel={`${HOME_UI.doNow.cta}: ${nextMission.title}`}
        />
      </View>
    </GameCard>
  )
}
