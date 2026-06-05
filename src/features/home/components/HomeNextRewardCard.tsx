import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { SHARED_TRANSITION_TAGS } from '@/constants'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { useHomeDashboard } from '@/features/home/hooks/use-home-dashboard'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'

export const HomeNextRewardCard = () => {
  const { nextReward } = useHomeDashboard()

  const handlePress = () => {
    if (nextReward.route) {
      router.push(nextReward.route as Href)
    }
  }

  return (
    <PressableScale
      fill
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${HOME_UI.nextReward.title}: ${nextReward.title}`}
      disabled={!nextReward.route}
    >
      <GameCard
        variant="reward"
        glow
        sharedTransitionTag={
          nextReward.key === 'loot' ? SHARED_TRANSITION_TAGS.lootHero : undefined
        }
        className="border-gold/40">
        <HomeSectionLabel emoji="🎁" title={HOME_UI.nextReward.title} tone="gold" />
        <HomeCardRow className="mt-3 items-center gap-3">
          <Text className="shrink-0 text-4xl">{nextReward.emoji}</Text>
          <View className={HOME_LAYOUT.growBlock}>
            <Text className="text-lg font-black text-foreground" numberOfLines={2}>
              {nextReward.title}
            </Text>
            <Text className="text-xs leading-4 text-foreground-secondary" numberOfLines={3}>
              {nextReward.subtitle}
            </Text>
          </View>
          <Text className="shrink-0 text-xl font-black text-gold">{nextReward.percent}%</Text>
        </HomeCardRow>
        <View className="mt-4">
          <RpgProgressBar value={nextReward.percent} variant="gold" height="md" animated />
        </View>
      </GameCard>
    </PressableScale>
  )
}
