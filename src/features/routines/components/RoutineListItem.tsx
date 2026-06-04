import { Text, View } from 'react-native';

import { Button, Card } from '@/components';
import type { RoutineTodayItem } from '@/types/routine';

import {
    ROUTINE_CATEGORY_LABELS,
    ROUTINE_CONSISTENCY_LABELS,
    ROUTINE_UI,
} from '../constants/routine-ui';
import { streakUnitLabel } from '../utils/routine-schedule';

type RoutineListItemProps = {
  item: RoutineTodayItem;
  onToggle: (routineId: string, completed: boolean) => void;
  loading?: boolean;
};

export const RoutineListItem = ({ item, onToggle, loading }: RoutineListItemProps) => {
  const { routine, stats, completed } = item;
  const unit = streakUnitLabel(routine.frequency);

  return (
    <Card elevated accent={!completed}>
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="text-base font-black text-foreground">{routine.name}</Text>
          {routine.description ? (
            <Text className="mt-0.5 text-xs text-foreground-secondary" numberOfLines={2}>
              {routine.description}
            </Text>
          ) : null}
          <Text className="mt-1 text-[10px] text-muted">
            {ROUTINE_CATEGORY_LABELS[routine.category]} · {ROUTINE_UI.streak(stats.currentStreak, unit)}
          </Text>
          <Text className="mt-0.5 text-[10px] text-muted">
            {ROUTINE_UI.completionRate}: {item.completionRate}% · {ROUTINE_UI.consistency}:{' '}
            {ROUTINE_CONSISTENCY_LABELS[item.consistencyLabel]}
          </Text>
        </View>
        <Text className="text-2xl">{completed ? '✅' : '⬜'}</Text>
      </View>

      <View className="mt-3">
        {completed ? (
          <Button
            label={ROUTINE_UI.uncomplete}
            variant="secondary"
            onPress={() => onToggle(routine.id, true)}
            disabled={loading}
          />
        ) : (
          <Button
            label={ROUTINE_UI.complete}
            onPress={() => onToggle(routine.id, false)}
            disabled={loading}
            loading={loading}
          />
        )}
      </View>
    </Card>
  );
};
