import { type Href, router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Text, View } from 'react-native';

import { Card, ProgressBar } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';
import { HomeCardSkeleton } from '@/features/home/components/HomeCardSkeleton';
import { cn } from '@/utils';
import { toProgressPercent } from '@/utils/progress';

import { ROUTINE_UI } from '../constants/routine-ui';
import { useRoutinesStore } from '../store/routines-store';

export const TodayRoutinePreview = () => {
  const dueToday = useRoutinesStore((s) => s.dueToday);
  const completedToday = useRoutinesStore((s) => s.completedToday);
  const isLoading = useRoutinesStore((s) => s.isLoading);
  const refresh = useRoutinesStore((s) => s.refresh);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const previewItems = useMemo(() => {
    return [...dueToday]
      .sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      })
      .slice(0, 4);
  }, [dueToday]);

  if (isLoading) {
    return <HomeCardSkeleton />;
  }

  if (dueToday.length === 0) {
    return (
      <PressableScale
        onPress={() => router.push(routes.routines as Href)}
        accessibilityRole="button"
        accessibilityLabel="Abrir rotinas">
        <Card accent className="border-accent/30">
          <Text className="text-xs font-bold uppercase tracking-widest text-accent">📋 Rotina de hoje</Text>
          <Text className="mt-2 text-sm text-foreground-secondary">{ROUTINE_UI.emptyToday}</Text>
          <Text className="mt-2 text-xs font-semibold text-accent">Criar rotina →</Text>
        </Card>
      </PressableScale>
    );
  }

  const completedCount = completedToday.length;
  const total = dueToday.length;
  const percentage = toProgressPercent(completedCount, total);
  const allDone = completedCount === total;

  return (
    <PressableScale
      onPress={() => router.push(routes.routines as Href)}
      accessibilityRole="button"
      accessibilityLabel="Ver rotina de hoje">
      <Card accent className="overflow-hidden border-accent/40">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-bold uppercase tracking-widest text-accent">
              📋 {ROUTINE_UI.todayTitle}
            </Text>
            <Text className="mt-1 text-xl font-black text-foreground">
              {completedCount}/{total} concluídas
            </Text>
            <Text className="mt-0.5 text-[10px] text-muted">{ROUTINE_UI.todayHint}</Text>
          </View>
          <Text className="text-3xl">{allDone ? '🌟' : '📋'}</Text>
        </View>
        <View className="mt-3">
          <ProgressBar value={percentage} variant="default" height="lg" animated={false} />
        </View>
        <View className="mt-3 gap-2">
          {previewItems.map((item) => (
            <View key={item.routine.id} className="flex-row items-center gap-2">
              <Text className="text-sm">{item.completed ? '✓' : '□'}</Text>
              <Text
                className={cn(
                  'flex-1 text-sm',
                  item.completed ? 'text-foreground-secondary line-through' : 'text-foreground',
                )}
                numberOfLines={1}>
                {item.routine.name}
              </Text>
            </View>
          ))}
        </View>
        <Text className="mt-3 text-xs font-semibold text-accent">Toque para gerenciar rotinas →</Text>
      </Card>
    </PressableScale>
  );
};
