import { type Href, router } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components'
import { GameCard } from '@/components/ui/game'
import type { StatisticsInsight } from '@/types/statistics'

import { STATISTICS_UI } from '../constants/statistics-ui'
import { getPrimaryStatisticsInsight } from '../utils/insights'

const INSIGHT_EMOJI: Record<string, string> = {
  study: '📚',
  streak: '🔥',
  contract: '📜',
  city: '🏙️',
  achievement: '🏆',
  loot_box: '🎁',
  pet: '🐾',
  general: '💡',
}

const INSIGHT_CATEGORY_LABEL: Record<string, string> = {
  study: 'Missões',
  streak: 'Sequência',
  contract: 'Contratos',
  city: 'Cidade',
  achievement: 'Conquistas',
  loot_box: 'Loot',
  pet: 'Pet',
  general: 'Dica',
}

type StatisticsInsightsFeedProps = {
  insights: StatisticsInsight[]
}

export const StatisticsInsightsFeed = ({ insights }: StatisticsInsightsFeedProps) => {
  const insight = getPrimaryStatisticsInsight(insights)
  if (!insight) return null

  const handlePress = () => {
    router.push(insight.route as Href)
  }

  const emoji = INSIGHT_EMOJI[insight.category] ?? '💡'
  const categoryLabel = INSIGHT_CATEGORY_LABEL[insight.category] ?? 'Dica'

  return (
    <GameCard variant="quest" className="gap-3 p-4">
      <View className="gap-1">
        <Text className="text-xs font-bold uppercase tracking-widest text-accent">
          {STATISTICS_UI.insightsFeed.eyebrow}
        </Text>
        <Text className="text-xs text-foreground-secondary">{STATISTICS_UI.insightsFeed.hint}</Text>
      </View>

      <View className="flex-row items-start gap-3">
        <View className="rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2.5">
          <Text className="text-3xl">{emoji}</Text>
        </View>
        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-xs font-bold uppercase tracking-wide text-primary">{categoryLabel}</Text>
          <Text className=" font-bold leading-snug text-foreground">{insight.message}</Text>
        </View>
      </View>

      <Button
        label={insight.ctaLabel}
        onPress={handlePress}
        accessibilityLabel={insight.ctaLabel}
        className="mt-1"
      />

      <Text className="text-xs leading-relaxed text-muted">{STATISTICS_UI.insightsFeed.footer}</Text>
    </GameCard>
  )
}
