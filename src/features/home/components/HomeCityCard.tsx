import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes, SHARED_TRANSITION_TAGS } from '@/constants'
import { useCity } from '@/features/city'
import { buildCityProgress } from '@/features/city/utils/progress'
import { HOME_UI } from '@/features/home/constants/home-ui'
import { getCityTierPercent } from '@/features/home/utils/home-dashboard'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import { usePlayerStore } from '@/features/player'

export const HomeCityCard = () => {
  const level = usePlayerStore((s) => s.level)
  const { summary } = useCity()
  const progress = buildCityProgress(level)
  const tierPercent = getCityTierPercent(level)
  const current = progress.currentBuilding
  const next = progress.nextBuilding

  return (
    <PressableScale
      fill
      onPress={() => router.push(routes.city as Href)}
      accessibilityRole="button"
      accessibilityLabel={HOME_UI.city.viewCity}
    >
      <GameCard
        variant="reward"
        sharedTransitionTag={SHARED_TRANSITION_TAGS.cityHero}
        className="border-gold/30">
        <HomeSectionLabel emoji="🏙️" title={HOME_UI.city.title} tone="gold" />

        <HomeCardRow className="mt-3 gap-3">
          <View className="shrink-0 rounded-2xl border border-gold/30 bg-gold/10 px-3 py-2">
            <Text className="text-4xl">{current.icon}</Text>
          </View>
          <View className={HOME_LAYOUT.growBlock}>
            <Text className="text-lg font-black text-foreground" numberOfLines={2}>
              {current.name}
            </Text>
            <Text className="text-xs leading-4 text-foreground-secondary">
              {summary.unlocked}/{summary.total} marcos · Nv. {level}
            </Text>
            {next ? (
              <Text className="mt-1 text-xs font-semibold leading-4 text-gold" numberOfLines={2}>
                {HOME_UI.city.nextEvolution}: {next.name} ({tierPercent}%)
              </Text>
            ) : (
              <Text className="mt-1 text-xs text-gold">Cidade completa 🏆</Text>
            )}
          </View>
        </HomeCardRow>

        <View className="mt-4">
          <RpgProgressBar
            value={tierPercent}
            variant="gold"
            height="md"
            label={next ? `${tierPercent}% até ${next.name}` : '100% desenvolvida'}
            animated
          />
        </View>

        <Text className="mt-3 text-xs font-bold text-gold">{HOME_UI.city.viewCity} →</Text>
      </GameCard>
    </PressableScale>
  )
}
