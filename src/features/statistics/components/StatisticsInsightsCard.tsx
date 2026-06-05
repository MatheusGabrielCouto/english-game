import { type Href, router } from 'expo-router'
import { Text } from 'react-native'

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

type StatisticsInsightsCardProps = {
  insights: StatisticsInsight[]
}

export const StatisticsInsightsCard = ({ insights }: StatisticsInsightsCardProps) => {
  const insight = getPrimaryStatisticsInsight(insights)
  if (!insight) return null

  const handlePress = () => {
    router.push(insight.route as Href)
  }

  return (
    <GameCard variant="quest" className="gap-3 p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-accent">
        {INSIGHT_EMOJI[insight.category] ?? '💡'} {STATISTICS_UI.insightsTitle}
      </Text>
      <Text className="text-sm leading-relaxed text-foreground-secondary">{insight.message}</Text>
      <Button label={insight.ctaLabel} onPress={handlePress} accessibilityLabel={insight.ctaLabel} />
    </GameCard>
  )
}
