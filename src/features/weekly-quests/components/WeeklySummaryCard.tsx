import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';

import { useWeeklyMissionsStore } from '../store/weekly-missions-store';

export const WeeklySummaryCard = () => {
  const missions = useWeeklyMissionsStore((s) => s.missions);

  const total = missions.length;
  const completed = missions.filter((m) => m.completed).length;
  const claimed = missions.filter((m) => m.claimed).length;
  const overallProgress =
    total > 0
      ? missions.reduce((sum, m) => {
          const target = m.targetValue > 0 ? m.targetValue : 1
          return sum + Math.min(m.currentValue / target, 1)
        }, 0) / total
      : 0

  return (
    <Card elevated>
      <Text className="text-sm text-foreground-secondary">Missões semanais</Text>
      <Text className="mt-1 text-2xl font-bold text-foreground">
        {completed} / {total} concluídas
      </Text>
      <Text className="mt-0.5 text-xs text-muted">{claimed} recompensas resgatadas</Text>
      <View className="mt-4">
        <ProgressBar
          value={Math.round(overallProgress * 100)}
          max={100}
          label="Progresso geral"
          showLabel
        />
      </View>
    </Card>
  );
};
