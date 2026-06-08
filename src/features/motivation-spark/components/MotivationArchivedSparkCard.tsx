import { type Href, router } from 'expo-router'
import { useCallback, useState } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { AppImage } from '@/components/ui/AppImage'
import { GameCard, PressableScale } from '@/components/ui/game'
import { motivationSparkHref } from '@/constants/routes'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { MotivationSparkService } from '../services/motivation-spark-service'
import { motivationContentKindEmoji, motivationMediaBadges } from '../utils/motivation-content-kind'
import { buildMotivationNotificationSnippet } from '../utils/motivation-snippet'

type MotivationArchivedSparkCardProps = {
  spark: MotivationSparkRecord
  onUnarchived?: () => void
}

export const MotivationArchivedSparkCard = ({
  spark,
  onUnarchived,
}: MotivationArchivedSparkCardProps) => {
  const [isRestoring, setIsRestoring] = useState(false)

  const handlePress = () => {
    router.push(motivationSparkHref(spark.id) as Href)
  }

  const handleUnarchive = useCallback(async () => {
    setIsRestoring(true)
    try {
      await MotivationSparkService.unarchive(spark.id)
      onUnarchived?.()
    } finally {
      setIsRestoring(false)
    }
  }, [onUnarchived, spark.id])

  const preview = buildMotivationNotificationSnippet(spark)
  const heroImage = spark.images[0] ?? null
  const badges = motivationMediaBadges(spark)

  return (
    <GameCard className="mb-3 border-dashed border-border/80 bg-surface/60 opacity-90">
      <PressableScale
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Abrir faísca arquivada ${spark.title}`}
      >
        <View className="flex-row items-start gap-3">
          {heroImage ? (
            <AppImage
              source={{ uri: heroImage }}
              surface="journal"
              recyclingKey={heroImage}
              className="rounded-2xl border border-border bg-surface opacity-80"
              style={{ width: 64, height: 64 }}
              contentFit="cover"
            />
          ) : (
            <View className="h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-background">
              <Text className="text-2xl opacity-70">
                {motivationContentKindEmoji(spark.contentKind)}
              </Text>
            </View>
          )}

          <View className="min-w-0 flex-1">
            <Text className="text-[10px] font-black uppercase tracking-[0.15em] text-muted">
              {MOTIVATION_UI.detail.archivedBadge}
            </Text>
            <Text className="mt-1 font-bold text-foreground" numberOfLines={2}>
              {spark.title}
            </Text>
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
      </PressableScale>

      <View className="mt-3 border-t border-border/60 pt-3">
        <Button
          label={MOTIVATION_UI.archived.restoreCta}
          size="sm"
          variant="secondary"
          loading={isRestoring}
          onPress={() => {
            void handleUnarchive()
          }}
        />
      </View>
    </GameCard>
  )
}
