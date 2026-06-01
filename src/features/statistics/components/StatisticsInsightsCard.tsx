import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { StatisticsInsight } from '@/types/statistics';

import { STATISTICS_UI } from '../constants/statistics-ui';

const INSIGHT_EMOJI: Record<string, string> = {
  study: '📚',
  streak: '🔥',
  contract: '📜',
  city: '🏙️',
  achievement: '🏆',
  general: '💡',
};

type StatisticsInsightsCardProps = {
  insights: StatisticsInsight[];
};

export const StatisticsInsightsCard = ({ insights }: StatisticsInsightsCardProps) => {
  if (insights.length === 0) return null;

  return (
    <GameCard variant="quest" className="gap-3 p-4">
      <Text className="text-xs font-bold uppercase tracking-widest text-accent">
        💡 {STATISTICS_UI.insightsTitle}
      </Text>
      <View className="gap-2">
        {insights.slice(0, 3).map((insight) => (
          <View
            key={insight.id}
            className="flex-row items-start gap-2 rounded-xl border border-accent/20 bg-surface px-3 py-2.5">
            <Text className="text-base">{INSIGHT_EMOJI[insight.category] ?? '💡'}</Text>
            <Text className="min-w-0 flex-1 text-sm leading-5 text-foreground-secondary">
              {insight.message}
            </Text>
          </View>
        ))}
      </View>
    </GameCard>
  );
};
