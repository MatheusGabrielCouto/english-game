import { Text, View } from 'react-native'

import { AppImage } from '@/components/ui/AppImage'
import { GameCard } from '@/components/ui/game'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { motivationMediaBadges } from '../utils/motivation-content-kind'

type MotivationSparkDetailHeroProps = {
  spark: MotivationSparkRecord
}

export const MotivationSparkDetailHero = ({ spark }: MotivationSparkDetailHeroProps) => {
  const heroImage = spark.images[0] ?? null
  const badges = motivationMediaBadges(spark)

  if (heroImage) {
    return (
      <View className="overflow-hidden rounded-2xl border border-orange-500/30">
        <View className="relative">
          <AppImage
            source={{ uri: heroImage }}
            surface="journal"
            recyclingKey={`detail-hero-${heroImage}`}
            className="w-full bg-surface"
            style={{ height: 220 }}
            contentFit="cover"
          />
          <View className="absolute inset-x-0 bottom-0 bg-black/70 px-5 py-5">
            {spark.isArchived ? (
              <Text className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                {MOTIVATION_UI.detail.archivedBadge}
              </Text>
            ) : spark.isPinned ? (
              <Text className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-gold">
                {MOTIVATION_UI.detail.pinnedBadge}
              </Text>
            ) : null}
            <Text className="text-2xl font-black leading-8 text-foreground">{spark.title}</Text>
          </View>
        </View>
        {badges.length > 0 ? (
          <View className="flex-row flex-wrap gap-2 border-t border-orange-500/20 bg-surface-elevated px-4 py-3">
            {badges.map((badge) => (
              <View
                key={badge}
                className="rounded-full border border-border bg-background px-2.5 py-1"
              >
                <Text className="text-[11px] font-semibold text-muted">{badge}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    )
  }

  return (
    <GameCard variant="reward" glow className="items-center gap-4 border-orange-500/35 py-8">
      <View className="h-20 w-20 items-center justify-center rounded-3xl border border-orange-500/30 bg-orange-500/10">
        <Text className="text-5xl">{MOTIVATION_UI.hub.emoji}</Text>
      </View>
      {spark.isArchived ? (
        <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
          {MOTIVATION_UI.detail.archivedBadge}
        </Text>
      ) : spark.isPinned ? (
        <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-gold">
          {MOTIVATION_UI.detail.pinnedBadge}
        </Text>
      ) : null}
      <Text className="text-center text-2xl font-black leading-8 text-foreground">{spark.title}</Text>
      {badges.length > 0 ? (
        <View className="flex-row flex-wrap justify-center gap-2">
          {badges.map((badge) => (
            <View
              key={badge}
              className="rounded-full border border-border bg-background px-2.5 py-1"
            >
              <Text className="text-[11px] font-semibold text-muted">{badge}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </GameCard>
  )
}
