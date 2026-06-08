import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { GameCard, PressableScale } from '@/components/ui/game'
import { routes } from '@/constants'
import { HomeCardRow } from '@/features/home/components/shared/HomeCardRow'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import { HomeStatPill } from '@/features/home/components/shared/HomeStatPill'
import { RpgProgressBar } from '@/features/home/components/shared/RpgProgressBar'
import { HOME_LAYOUT } from '@/features/home/constants/home-layout'
import { HOME_UI } from '@/features/home/constants/home-ui'
import type { HomeSeasonSnapshot } from '@/features/home/hooks/use-home-events'
import { useHomeEvents } from '@/features/home/hooks/use-home-events'
import { formatDaysRemainingLabel } from '@/features/home/utils/home-events'
import type { ActiveCityEventViewModel } from '@/types/city-event'

type HomeEventBlockProps = {
  emoji: string
  title: string
  subtitle: string
  daysLabel: string
  cta: string
  badgeValue?: string
  badgeTone?: 'accent' | 'gold' | 'warning'
  progressPercent?: number
  progressLabel?: string
  onPress: () => void
  accessibilityLabel: string
}

const HomeEventBlock = ({
  emoji,
  title,
  subtitle,
  daysLabel,
  cta,
  badgeValue,
  badgeTone = 'accent',
  progressPercent,
  progressLabel,
  onPress,
  accessibilityLabel,
}: HomeEventBlockProps) => (
  <PressableScale
    fill
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}>
    <View className="gap-3 rounded-2xl border border-border/80 bg-surface px-3 py-3">
      <HomeCardRow className="items-start gap-3">
        <View className="shrink-0 rounded-xl border border-border bg-background px-2.5 py-2">
          <Text className="text-2xl">{emoji}</Text>
        </View>
        <View className={HOME_LAYOUT.growBlock}>
          <Text className=" font-black text-foreground" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-0.5 text-sm leading-5 text-foreground-secondary" numberOfLines={2}>
            {subtitle}
          </Text>
        </View>
        <HomeStatPill emoji="⏳" label="Restam" value={daysLabel} tone={badgeTone} />
      </HomeCardRow>

      {typeof progressPercent === 'number' ? (
        <View className="gap-1">
          {progressLabel ? (
            <Text className="text-xs text-foreground-secondary" numberOfLines={1}>
              {progressLabel}
            </Text>
          ) : null}
          <RpgProgressBar value={progressPercent} variant="gold" height="sm" animated={false} />
        </View>
      ) : null}

      {badgeValue ? (
        <View className="self-start rounded-full border border-gold/35 bg-gold/12 px-2.5 py-1">
          <Text className="text-[10px] font-bold text-gold">{badgeValue}</Text>
        </View>
      ) : null}

      <Text className="text-xs font-bold text-accent">{cta} →</Text>
    </View>
  </PressableScale>
)

const CityEventBlock = ({ event }: { event: ActiveCityEventViewModel }) => (
  <HomeEventBlock
    emoji={event.emoji}
    title={event.name}
    subtitle={event.description}
    daysLabel={formatDaysRemainingLabel(event.daysRemaining)}
    cta={HOME_UI.events.viewCity}
    progressPercent={event.spiritProgress}
    progressLabel={HOME_UI.events.spiritLine(event.spiritProgress, event.spiritLabel)}
    onPress={() => router.push(routes.city as Href)}
    accessibilityLabel={`${HOME_UI.events.citySection}: ${event.name}, ${formatDaysRemainingLabel(event.daysRemaining)}`}
  />
)

const SeasonEventBlock = ({ season }: { season: HomeSeasonSnapshot }) => (
  <HomeEventBlock
    emoji="🏛️"
    title={season.seasonLabel}
    subtitle={HOME_UI.events.tierLine(season.tier, season.seasonPoints)}
    daysLabel={season.daysLeftLabel}
    cta={HOME_UI.events.viewSeason}
    badgeValue={
      season.claimableTiers > 0 ? HOME_UI.events.claimable(season.claimableTiers) : undefined
    }
    badgeTone="gold"
    progressPercent={season.tierProgressPercent}
    progressLabel={
      season.nextRewardLabel ? HOME_UI.events.nextTier(season.nextRewardLabel) : undefined
    }
    onPress={() => router.push(routes.metagame as Href)}
    accessibilityLabel={`${HOME_UI.events.seasonSection}: ${season.seasonLabel}, ${season.daysLeftLabel}`}
  />
)

export const HomeEventsCard = () => {
  const { cityEvent, season, hasRealContent } = useHomeEvents()

  if (!hasRealContent) {
    return null
  }

  return (
    <GameCard variant="default" className="border-border/80">
      <HomeSectionLabel emoji="🎪" title={HOME_UI.events.title} tone="accent" />

      <View className="mt-3 gap-3">
        {cityEvent ? <CityEventBlock event={cityEvent} /> : null}
        {season ? <SeasonEventBlock season={season} /> : null}
      </View>
    </GameCard>
  )
}
