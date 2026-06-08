import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import { motivationSparkHref, routes } from '@/constants'
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton'
import { HOME_UI } from '@/features/home/constants/home-ui'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { useDailyMotivationSpark } from '../hooks/use-daily-motivation-spark'
import { MotivationSparkSpotlightLayout } from './MotivationSparkSpotlightLayout'

export const HomeMotivationSparkCard = () => {
  const { spark, showOnHome, hasHydrated, isSyncing } = useDailyMotivationSpark()

  if (!showOnHome) return null

  if (!hasHydrated || isSyncing) {
    return <HomeCardSkeleton />
  }

  const handleOpenHub = () => {
    router.push(routes.motivation.hub as Href)
  }

  const handleCreate = () => {
    router.push(routes.motivation.create as Href)
  }

  const handleOpenSpark = () => {
    if (!spark) return
    router.push(motivationSparkHref(spark.id) as Href)
  }

  if (!spark) {
    return (
      <GameCard variant="reward" glow className="gap-4 border-orange-500/35">
        <View className="items-center gap-4">
          <View className="h-20 w-20 items-center justify-center rounded-3xl border border-orange-500/30 bg-orange-500/10">
            <Text className="text-5xl">{MOTIVATION_UI.hub.emoji}</Text>
          </View>
          <View className="w-full items-center">
            <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
              {MOTIVATION_UI.hub.emoji} {HOME_UI.motivationSpark.subtitle}
            </Text>
            <Text className="mt-2 text-center text-lg font-black text-foreground">
              {HOME_UI.motivationSpark.emptyTitle}
            </Text>
            <Text className="mt-3 text-center text-sm leading-6 text-foreground-secondary">
              {HOME_UI.motivationSpark.emptyBody}
            </Text>
            <Text className="mt-2 text-center text-xs leading-5 text-muted">
              {MOTIVATION_UI.hub.heroBody}
            </Text>
          </View>
        </View>
        <View className="gap-3">
          <Button label={HOME_UI.motivationSpark.createCta} size="lg" onPress={handleCreate} />
          <Button
            label={HOME_UI.motivationSpark.openHubCta}
            size="lg"
            variant="secondary"
            onPress={handleOpenHub}
          />
        </View>
      </GameCard>
    )
  }

  return (
    <MotivationSparkSpotlightLayout
      spark={spark}
      compact
      sectionTitle={HOME_UI.motivationSpark.title}
      sectionSubtitle={HOME_UI.motivationSpark.subtitle}
      onOpen={handleOpenSpark}
      primaryCta={MOTIVATION_UI.hub.dailyOpenCta}
      secondaryCta={HOME_UI.motivationSpark.openHubCta}
      onSecondary={handleOpenHub}
    />
  )
}
