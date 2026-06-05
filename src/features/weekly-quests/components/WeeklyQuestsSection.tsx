import { useEffect } from 'react';
import { View } from 'react-native';

import { ListItemSkeleton } from '@/components/ui/skeleton';
import { Toast } from '@/components/ui/Toast';
import { QuestSectionHeader } from '@/features/quests/components/QuestSectionHeader';

import { useWeeklyMissionsStore } from '../store/weekly-missions-store';
import { WeeklyMissionCard } from './WeeklyMissionCard';

type WeeklyQuestsSectionProps = {
  showHeader?: boolean
}

export const WeeklyQuestsSection = ({ showHeader = true }: WeeklyQuestsSectionProps) => {
  const missions = useWeeklyMissionsStore((s) => s.missions);
  const isLoading = useWeeklyMissionsStore((s) => s.isLoading);
  const claimMessage = useWeeklyMissionsStore((s) => s.claimMessage);
  const completedFlashId = useWeeklyMissionsStore((s) => s.completedFlashId);
  const init = useWeeklyMissionsStore((s) => s.init);
  const claim = useWeeklyMissionsStore((s) => s.claim);
  const claimingMissionId = useWeeklyMissionsStore((s) => s.claimingMissionId);
  const clearClaimMessage = useWeeklyMissionsStore((s) => s.clearClaimMessage);
  const clearCompletedFlash = useWeeklyMissionsStore((s) => s.clearCompletedFlash);

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, [init]);

  useEffect(() => {
    if (!completedFlashId) return;
    const timer = setTimeout(clearCompletedFlash, 2500);
    return () => clearTimeout(timer);
  }, [completedFlashId, clearCompletedFlash]);

  const completedCount = missions.filter((mission) => mission.completed).length;
  const claimableCount = missions.filter(
    (mission) => mission.completed && !mission.claimed,
  ).length;

  return (
    <View className="relative gap-3">
      {showHeader ? (
        <QuestSectionHeader
          emoji="📅"
          title="Semanais"
          subtitle="Progresso automático enquanto você joga"
          badge={
            claimableCount > 0
              ? `${claimableCount} para resgatar`
              : `${completedCount}/${missions.length}`
          }
        />
      ) : null}

      {isLoading ? (
        <View className="gap-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
        </View>
      ) : (
        <View className="gap-3">
          {missions.map((mission) => (
            <WeeklyMissionCard
              key={`${mission.id}-${mission.weekStartDate}`}
              mission={mission}
              onClaim={(id) => void claim(id)}
              isClaiming={claimingMissionId === mission.id}
              claimDisabled={claimingMissionId !== null}
              highlightCompleted={mission.id === completedFlashId}
            />
          ))}
        </View>
      )}

      <Toast message={claimMessage} onDismiss={clearClaimMessage} />
    </View>
  );
};
