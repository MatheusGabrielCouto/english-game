import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { LEARNING_SKILL_BY_KEY } from '@/features/learning-gps/constants/learning-skills'

import { MENTOR_AI_UI } from '../constants/mentor-ai-ui'
import { useMentorAi } from '../hooks/use-mentor-ai'

export const HomeMentorCard = () => {
  const { snapshot, hasHydrated, isSyncing } = useMentorAi()

  const handleOpenDashboard = () => {
    router.push(routes.mentor.dashboard as Href)
  }

  if (!hasHydrated || isSyncing || !snapshot) {
    return <HomeCardSkeleton />
  }

  const weakest = LEARNING_SKILL_BY_KEY[snapshot.context.skills.weakest]

  return (
    <PressableScale
      fill
      onPress={handleOpenDashboard}
      accessibilityRole="button"
      accessibilityLabel={MENTOR_AI_UI.home.openDashboard}>
      <GameCard variant="default" className="overflow-hidden border-accent/35 bg-accent/5">
        <View className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10" />
        <HomeCardRow className="relative justify-between gap-2">
          <View className={HOME_LAYOUT.growBlock}>
            <HomeSectionLabel
              emoji={MENTOR_AI_UI.emoji}
              title={MENTOR_AI_UI.home.cardTitle}
              subtitle={MENTOR_AI_UI.home.cardSubtitle}
              tone="gold"
            />
          </View>
          <Text className="shrink-0 text-3xl">{MENTOR_AI_UI.emoji}</Text>
        </HomeCardRow>

        <View className="relative mt-3 flex-row flex-wrap gap-1.5">
          <View className="rounded-full border border-border/60 bg-background/50 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-foreground-secondary">
              {snapshot.context.learningGps.worldCefr}
            </Text>
          </View>
          <View className="rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-warning">
              {MENTOR_AI_UI.home.weakestPreview(weakest.label)}
            </Text>
          </View>
        </View>

        <View className="relative mt-3 rounded-xl border border-border/60 bg-background/50 px-3 py-2.5">
          <Text className="text-sm leading-5 text-foreground" numberOfLines={2}>
            {MENTOR_AI_UI.home.recommendationPreview(snapshot.recommendation.summary)}
          </Text>
        </View>

        <View className="relative mt-3 flex-row items-center justify-between">
          <Text className="text-xs font-bold text-accent">{MENTOR_AI_UI.home.openDashboard} →</Text>
          <View className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5">
            <Text className="text-[10px] font-bold text-accent">{MENTOR_AI_UI.home.offlineBadge}</Text>
          </View>
        </View>
      </GameCard>
    </PressableScale>
  )
}
