import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { AppImage } from '@/components/ui/AppImage'
import { GameCard, PressableScale } from '@/components/ui/game'
import { motivationSparkHref } from '@/constants/routes'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { motivationContentKindEmoji, motivationMediaBadges } from '../utils/motivation-content-kind'
import { buildMotivationNotificationSnippet } from '../utils/motivation-snippet'

type MotivationSparkCardProps = {
  spark: MotivationSparkRecord
}

export const MotivationSparkCard = ({ spark }: MotivationSparkCardProps) => {
  const handlePress = () => {
    router.push(motivationSparkHref(spark.id) as Href)
  }

  const preview = buildMotivationNotificationSnippet(spark)
  const heroImage = spark.images[0] ?? null
  const badges = motivationMediaBadges(spark)

  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Abrir faísca ${spark.title}`}
      className="mb-3"
    >
      <GameCard
        glow={spark.isPinned}
        className={spark.isPinned ? 'border-orange-500/45' : 'border-border/80'}
      >
        <View className="flex-row items-start gap-3">
          {heroImage ? (
            <AppImage
              source={{ uri: heroImage }}
              surface="journal"
              recyclingKey={heroImage}
              className="rounded-2xl border border-border bg-surface"
              style={{ width: 64, height: 64 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-500/25 bg-orange-500/10">
              <Text className="text-2xl">{motivationContentKindEmoji(spark.contentKind)}</Text>
            </View>
          )}

          <View className="min-w-0 flex-1">
            <View className="flex-row flex-wrap items-center gap-2">
              {spark.isPinned ? (
                <Text className="text-[10px] font-black uppercase tracking-[0.15em] text-gold">
                  {MOTIVATION_UI.detail.pinnedBadge}
                </Text>
              ) : null}
              <Text className="flex-1 font-bold text-foreground" numberOfLines={2}>
                {spark.title}
              </Text>
            </View>

            <Text className="mt-1.5 text-sm leading-5 text-foreground-secondary" numberOfLines={3}>
              {preview}
            </Text>

            {badges.length > 0 ? (
              <View className="mt-3 flex-row flex-wrap gap-1.5">
                {badges.map((badge) => (
                  <View
                    key={badge}
                    className="rounded-full border border-border/80 bg-background px-2 py-0.5"
                  >
                    <Text className="text-[10px] font-semibold text-muted">{badge}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </GameCard>
    </PressableScale>
  )
}
