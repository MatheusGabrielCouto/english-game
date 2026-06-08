import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import type { StatisticsDashboard } from '@/types/statistics';

import { formatNumber } from '../utils/formatters';

type QuestsSectionProps = {
  quests: StatisticsDashboard['quests'];
};

const QuestRow = ({
  label,
  completed,
  total,
  rate,
}: {
  label: string;
  completed: number;
  total: number;
  rate: number;
}) => (
  <View className="gap-2 rounded-xl border border-border bg-surface px-3 py-3">
    <Text className="text-sm font-semibold text-foreground">{label}</Text>
    <Text className=" font-black text-primary">
      {formatNumber(completed)} / {formatNumber(total)} · {rate}%
    </Text>
    <ProgressBar value={rate} max={100} variant="xp" height="sm" />
  </View>
);

export const QuestsSection = ({ quests }: QuestsSectionProps) => (
  <View className="gap-2">
    <QuestRow
      label="Missões diárias"
      completed={quests.dailyCompleted}
      total={quests.dailyTotal}
      rate={quests.dailyCompletionRate}
    />
    <QuestRow
      label="Missões semanais"
      completed={quests.weeklyCompleted}
      total={quests.weeklyTotal}
      rate={quests.weeklyCompletionRate}
    />
  </View>
);
