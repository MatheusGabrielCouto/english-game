import { Text, View } from 'react-native'

import { Button } from '@/components'
import { AppImage } from '@/components/ui/AppImage'
import { GameCard } from '@/components/ui/game'
import { HomeSectionLabel } from '@/features/home/components/shared/HomeSectionLabel'
import type { MotivationSparkRecord } from '@/types/motivation-spark'

import { MOTIVATION_UI } from '../constants/motivation-ui'
import { motivationMediaBadges } from '../utils/motivation-content-kind'
import { buildMotivationNotificationSnippet } from '../utils/motivation-snippet'

type MotivationSparkSpotlightLayoutProps = {
  spark: MotivationSparkRecord
  onOpen: () => void
  primaryCta: string
  secondaryCta?: string
  onSecondary?: () => void
  compact?: boolean
  sectionTitle?: string
  sectionSubtitle?: string
}

export const MotivationSparkSpotlightLayout = ({
  spark,
  onOpen,
  primaryCta,
  secondaryCta,
  onSecondary,
  compact = false,
  sectionTitle = MOTIVATION_UI.hub.dailySectionTitle,
  sectionSubtitle = MOTIVATION_UI.hub.dailySectionSubtitle,
}: MotivationSparkSpotlightLayoutProps) => {
  const preview = buildMotivationNotificationSnippet(spark)
  const heroImage = spark.images[0] ?? null
  const badges = motivationMediaBadges(spark)
  const bannerHeight = compact ? 120 : 160

  return (
    <GameCard variant="hero" glow className="gap-0 overflow-hidden border-orange-500/40 p-0">
      {heroImage ? (
        <View className="relative">
          <AppImage
            source={{ uri: heroImage }}
            surface="journal"
            recyclingKey={`spotlight-${heroImage}`}
            className="w-full bg-surface"
            style={{ height: bannerHeight }}
            contentFit="cover"
          />
          <View className="absolute inset-x-0 bottom-0 bg-black/65 px-5 py-4">
            <HomeSectionLabel
              emoji={MOTIVATION_UI.hub.emoji}
              title={sectionTitle}
              subtitle={sectionSubtitle}
              tone="gold"
            />
          </View>
        </View>
      ) : (
        <View className="border-b border-orange-500/20 bg-orange-500/10 px-5 py-4">
          <HomeSectionLabel
            emoji={MOTIVATION_UI.hub.emoji}
            title={sectionTitle}
            subtitle={sectionSubtitle}
            tone="gold"
          />
        </View>
      )}

      <View className="gap-4 p-5">
        {!heroImage ? (
          <View
            className={`items-center justify-center self-center rounded-2xl border border-orange-500/30 bg-orange-500/10 ${
              compact ? 'h-14 w-14' : 'h-16 w-16'
            }`}
          >
            <Text className={compact ? 'text-3xl' : 'text-4xl'}>{MOTIVATION_UI.hub.emoji}</Text>
          </View>
        ) : null}

        <View>
          {spark.isPinned ? (
            <Text className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-gold">
              {MOTIVATION_UI.detail.pinnedBadge}
            </Text>
          ) : null}
          <Text
            className={`font-black leading-7 text-foreground ${compact ? 'text-lg' : 'text-xl'}`}
            numberOfLines={2}
          >
            {spark.title}
          </Text>
          <View className="mt-3 border-l-2 border-orange-500/40 pl-3">
            <Text
              className={`italic leading-6 text-foreground-secondary ${compact ? 'text-sm' : 'text-sm'}`}
              numberOfLines={compact ? 3 : 4}
            >
              {preview}
            </Text>
          </View>
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

        <View className={secondaryCta && onSecondary ? 'gap-3' : undefined}>
          <Button
            label={primaryCta}
            size="lg"
            onPress={onOpen}
            accessibilityLabel={`${primaryCta}: ${spark.title}`}
          />
          {secondaryCta && onSecondary ? (
            <Button label={secondaryCta} size="lg" variant="secondary" onPress={onSecondary} />
          ) : null}
        </View>
      </View>
    </GameCard>
  )
}
