import { Text, View } from 'react-native';

import { Card, EmptyState } from '@/components';
import { AppIcon } from '@/components/ui/AppIcon';
import { theme } from '@/constants';

import { formatStudyDateLabel, isToday } from '../utils/date';

type StudyHistoryListProps = {
  studyDays: string[];
};

export const StudyHistoryList = ({ studyDays }: StudyHistoryListProps) => {
  if (studyDays.length === 0) {
    return (
      <EmptyState
        icon="calendar-outline"
        title="Nenhum dia registrado"
        description="Complete uma missão diária para registrar seu primeiro dia de estudo."
      />
    );
  }

  return (
    <Card elevated>
      <Text className="mb-4 text-base font-semibold text-foreground">Histórico recente</Text>
      <View className="gap-3">
        {studyDays.map((dateKey) => (
          <View
            key={dateKey}
            className="flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <View className="flex-row items-center gap-3">
              <View className="rounded-lg bg-success/15 p-2">
                <AppIcon name="checkmark-circle" size={18} color={theme.colors.success} />
              </View>
              <View>
                <Text className="text-sm font-medium capitalize text-foreground">
                  {formatStudyDateLabel(dateKey)}
                </Text>
                {isToday(dateKey) ? (
                  <Text className="text-xs text-accent">Hoje</Text>
                ) : null}
              </View>
            </View>
            <Text className="text-xs text-muted">Estudou</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};
