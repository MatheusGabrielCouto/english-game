import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components';
import { GameCard } from '@/components/ui/game';
import { ScreenSkeleton } from '@/components/ui/skeleton';
import { LearningSectionHeader } from '@/features/learning/components/ui';
import type { UserRoutineRecord } from '@/types/routine';

import { ROUTINE_TEMPLATES } from '../catalogs/routine-templates';
import { ROUTINE_UI } from '../constants/routine-ui';
import { RoutineService } from '../services/routine-service';
import { useRoutinesStore } from '../store/routines-store';
import { RoutineFormModal } from './RoutineFormModal';
import { RoutineListItem } from './RoutineListItem';

type RoutinesScreenContentProps = {
  embedded?: boolean;
};

export const RoutinesScreenContent = ({ embedded = false }: RoutinesScreenContentProps) => {
  const dueToday = useRoutinesStore((s) => s.dueToday);
  const pendingToday = useRoutinesStore((s) => s.pendingToday);
  const completedToday = useRoutinesStore((s) => s.completedToday);
  const todayItems = useRoutinesStore((s) => s.todayItems);
  const isLoading = useRoutinesStore((s) => s.isLoading);
  const refresh = useRoutinesStore((s) => s.refresh);

  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<UserRoutineRecord | null>(null);
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const handleToggle = useCallback(
    async (routineId: string, wasCompleted: boolean) => {
      setTogglingId(routineId);
      try {
        if (wasCompleted) {
          await RoutineService.uncomplete(routineId);
        } else {
          await RoutineService.complete(routineId);
        }
      } finally {
        setTogglingId(null);
      }
    },
    [],
  );

  const openCreate = () => {
    setEditing(null);
    setTemplateKey(null);
    setFormVisible(true);
  };

  const openTemplate = (key: string) => {
    setEditing(null);
    setTemplateKey(key);
    setFormVisible(true);
  };

  if (isLoading) {
    return <ScreenSkeleton variant="quest" className="gap-5 pb-0" />;
  }

  const upcoming = todayItems.filter((item) => !item.isDueToday && !item.completed);

  return (
    <View className="gap-5">
      {embedded ? null : (
        <GameCard variant="quest" glow>
          <Text className="text-xs font-bold uppercase tracking-widest text-primary">
            {ROUTINE_UI.screenTitle}
          </Text>
          <Text className="mt-1 text-sm text-foreground-secondary">{ROUTINE_UI.screenSubtitle}</Text>
          <Text className="mt-2 text-[10px] text-muted">{ROUTINE_UI.questsDivider}</Text>
        </GameCard>
      )}

      <LearningSectionHeader emoji="☀️" title={ROUTINE_UI.todayTitle} hint={ROUTINE_UI.todayHint} />

      {dueToday.length === 0 ? (
        <Text className="text-sm text-foreground-secondary">{ROUTINE_UI.emptyToday}</Text>
      ) : (
        <View className="gap-3">
          {pendingToday.map((item) => (
            <RoutineListItem
              key={item.routine.id}
              item={item}
              onToggle={handleToggle}
              loading={togglingId === item.routine.id}
            />
          ))}
          {completedToday.length > 0 ? (
            <>
              <Text className="text-xs font-bold uppercase text-success">{ROUTINE_UI.completed}</Text>
              {completedToday.map((item) => (
                <RoutineListItem
                  key={item.routine.id}
                  item={item}
                  onToggle={handleToggle}
                  loading={togglingId === item.routine.id}
                />
              ))}
            </>
          ) : null}
        </View>
      )}

      {upcoming.length > 0 ? (
        <>
          <LearningSectionHeader emoji="📆" title={ROUTINE_UI.upcoming} hint="Fora do calendário de hoje" />
          {upcoming.map((item) => (
            <View key={item.routine.id} className="rounded-xl border border-border bg-surface px-4 py-3">
              <Text className="font-bold text-foreground">{item.routine.name}</Text>
              <Text className="text-xs text-muted">Próxima janela em breve</Text>
            </View>
          ))}
        </>
      ) : null}

      <LearningSectionHeader emoji="✨" title={ROUTINE_UI.fromTemplate} hint="Modelos prontos" />
      <View className="flex-row flex-wrap gap-2">
        {ROUTINE_TEMPLATES.map((template) => (
          <Button
            key={template.key}
            label={`${template.emoji} ${template.name}`}
            variant="secondary"
            onPress={() => openTemplate(template.key)}
          />
        ))}
      </View>

      <Button label={ROUTINE_UI.addRoutine} onPress={openCreate} />

      <RoutineFormModal
        visible={formVisible}
        editing={editing}
        templateKey={templateKey}
        onClose={() => setFormVisible(false)}
        onSaved={() => undefined}
      />
    </View>
  );
};
