import { Text, View } from 'react-native'

import { GameCard } from '@/components/ui/game'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'

type MotivationHubHeroProps = {
  sparks: MotivationSparkRecord[]
}

const StatPill = ({ label, highlight }: { label: string; highlight?: boolean }) => (
  <View
    className={`rounded-full px-2.5 py-1 ${
      highlight ? 'border border-orange-500/30 bg-orange-500/15' : 'border border-border bg-background'
    }`}
  >
    <Text
      className={`text-[11px] font-semibold ${highlight ? 'text-streak' : 'text-muted'}`}
    >
      {label}
    </Text>
  </View>
)

export const MotivationHubHero = ({ sparks }: MotivationHubHeroProps) => {
  const withMedia = sparks.filter(
    (spark) => spark.images.length > 0 || spark.audioUri || spark.links.length > 0,
  ).length
  const pinnedCount = sparks.filter((spark) => spark.isPinned).length

  return (
    <GameCard variant="reward" glow className="gap-3 border-orange-500/35">
      <View>
        <Text className="text-xs font-bold uppercase tracking-widest text-streak">
          {MOTIVATION_UI.hub.tagline}
        </Text>
        <Text className="mt-1 text-lg font-black text-foreground">{MOTIVATION_UI.hub.heroTitle}</Text>
      </View>

      {sparks.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          <StatPill label={MOTIVATION_UI.hub.statsSparks(sparks.length)} highlight />
          {withMedia > 0 ? <StatPill label={MOTIVATION_UI.hub.statsWithMedia(withMedia)} /> : null}
          {pinnedCount > 0 ? <StatPill label={MOTIVATION_UI.hub.statsPinned(pinnedCount)} /> : null}
        </View>
      ) : null}

      <Text className="text-xs leading-5 text-foreground-secondary">{MOTIVATION_UI.hub.heroBody}</Text>
    </GameCard>
  )
}
