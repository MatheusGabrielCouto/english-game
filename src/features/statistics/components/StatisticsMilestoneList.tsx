import { Text, View } from 'react-native';

import { GameCard } from '@/components/ui/game';
import type { StatisticsMilestoneRecord } from '@/types/statistics';

import { STATISTICS_MESSAGES } from '../constants/default-statistics';
import { STATISTICS_UI } from '../constants/statistics-ui';

type StatisticsMilestoneListProps = {
  milestones: StatisticsMilestoneRecord[];
};

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

const CATEGORY_EMOJI: Record<string, string> = {
  study: '📚',
  streak: '🔥',
  contract: '📜',
  achievement: '🏆',
  title: '👑',
  loot_box: '🎁',
  pet: '🐾',
  city: '🏙️',
  level: '⭐',
  system: '⚙️',
};

export const StatisticsMilestoneList = ({ milestones }: StatisticsMilestoneListProps) => {
  if (milestones.length === 0) {
    return (
      <Text className="text-sm text-foreground-secondary">{STATISTICS_MESSAGES.emptyMilestones}</Text>
    );
  }

  const preview = milestones.slice(0, STATISTICS_UI.milestonesPreview);
  const hiddenCount = milestones.length - preview.length;

  return (
    <View className="gap-2">
      {preview.map((milestone) => (
        <View
          key={milestone.id}
          className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
          <Text className="text-lg">{CATEGORY_EMOJI[milestone.category] ?? '📌'}</Text>
          <View className="min-w-0 flex-1">
            <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
              {milestone.label}
            </Text>
            <Text className="text-[10px] text-muted">{formatDate(milestone.occurredAt)}</Text>
          </View>
        </View>
      ))}

      {hiddenCount > 0 ? (
        <GameCard variant="default" className="items-center py-3">
          <Text className="text-xs text-muted">{STATISTICS_UI.milestonesMore(hiddenCount)}</Text>
        </GameCard>
      ) : null}
    </View>
  );
};
