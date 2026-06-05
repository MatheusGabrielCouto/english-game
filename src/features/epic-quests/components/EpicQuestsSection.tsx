import { Text, View } from 'react-native';

import { Card, EmptyState, ProgressBar } from '@/components';
import { QuestSectionHeader } from '@/features/quests/components/QuestSectionHeader';
import { QUESTS_UI } from '@/features/quests/constants/quests-ui';
import type { EpicMissionViewModel } from '@/types/epic-mission';
import { cn } from '@/utils';

type EpicQuestsSectionProps = {
  missions: EpicMissionViewModel[];
  showHeader?: boolean;
};

const DIFFICULTY_EMOJI: Record<string, string> = {
  easy: '🟢',
  medium: '🟡',
  hard: '🟠',
  expert: '🔴',
};

export const EpicQuestsSection = ({ missions, showHeader = true }: EpicQuestsSectionProps) => {
  if (missions.length === 0) {
    return (
      <EmptyState
        icon="map-outline"
        title={QUESTS_UI.epic.emptyTitle}
        description={QUESTS_UI.epic.emptyDescription}
      />
    );
  }

  const activeCount = missions.filter((mission) => mission.status === 'active').length;

  return (
    <View className="gap-3">
      {showHeader ? (
        <QuestSectionHeader
          emoji="🐉"
          title="Épicas"
          subtitle={QUESTS_UI.epic.subtitle}
          badge={`${activeCount} ativas`}
        />
      ) : null}

      {missions.map((mission) => (
        <Card
          key={mission.id}
          elevated
          className={cn(
            'overflow-hidden border-legendary/20',
            mission.isComplete && 'border-success/30 bg-success/5',
          )}>
          <View className="absolute left-0 top-0 h-full w-1 bg-legendary/60" />

          <View className="pl-2">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-legendary">
                  Epic Quest
                </Text>
                <Text className="mt-1 text-base font-bold text-foreground">{mission.title}</Text>
                <Text className="mt-1 text-sm leading-relaxed text-foreground-secondary">
                  {mission.description}
                </Text>
              </View>
              <Text className="text-lg">
                {DIFFICULTY_EMOJI[mission.difficulty] ?? '⚔️'}
              </Text>
            </View>

            <View className="mt-4">
              <ProgressBar
                value={mission.percentage}
                variant={mission.isComplete ? 'gold' : 'xp'}
                height="md"
                showLabel
              />
              <View className="mt-3 flex-row flex-wrap items-center justify-between gap-2">
                <Text className="text-xs text-foreground-secondary">
                  {mission.currentValue} / {mission.targetValue}
                </Text>
                <View className="flex-row gap-3">
                  <Text className="text-xs font-bold text-xp">+{mission.xpReward} XP</Text>
                  <Text className="text-xs font-bold text-coin">+{mission.coinReward} 🪙</Text>
                </View>
              </View>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
};
