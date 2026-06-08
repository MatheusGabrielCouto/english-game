import { Pressable, Text, View } from 'react-native';

import { Button, Card, ProgressBar } from '@/components';
import { getWeeklyMissionStatus, type WeeklyMission } from '@/types/weekly-mission';
import { cn } from '@/utils';

type WeeklyMissionCardProps = {
  mission: WeeklyMission;
  onClaim: (id: string) => void | Promise<void>;
  highlightCompleted?: boolean;
  isClaiming?: boolean;
  claimDisabled?: boolean;
};

const statusLabels = {
  in_progress: 'Em progresso',
  completed: 'Concluída',
  claimed: 'Resgatada',
} as const;

const statusStyles = {
  in_progress: 'bg-surface-elevated text-foreground-secondary',
  completed: 'bg-primary/25 text-primary',
  claimed: 'bg-success/20 text-success',
} as const;

export const WeeklyMissionCard = ({
  mission,
  onClaim,
  highlightCompleted,
  isClaiming = false,
  claimDisabled = false,
}: WeeklyMissionCardProps) => {
  const status = getWeeklyMissionStatus(mission);
  const canClaim = status === 'completed';

  const handleClaim = () => {
    if (!canClaim || isClaiming || claimDisabled) return;
    void onClaim(mission.id);
  };

  return (
    <Card
      className={cn(
        highlightCompleted && status === 'completed' && 'border-primary/50',
        status === 'claimed' && 'opacity-90',
      )}
      elevated>
      <View className="mb-2 flex-row items-start justify-between gap-2">
        <Text className="flex-1  font-semibold text-foreground">{mission.title}</Text>
        <View className={cn('rounded-md px-2 py-0.5', statusStyles[status])}>
          <Text className="text-xs font-semibold">{statusLabels[status]}</Text>
        </View>
      </View>

      <Text className="mb-3 text-sm text-foreground-secondary">{mission.description}</Text>

      <ProgressBar
        value={mission.currentValue}
        max={mission.targetValue}
        label="Progresso"
        showLabel
      />

      <View className="mt-3 flex-row gap-4">
        <Text className="text-xs font-medium text-primary">+{mission.xpReward} XP</Text>
        <Text className="text-xs font-medium text-accent">+{mission.coinReward} moedas</Text>
      </View>

      {canClaim ? (
        <View className="mt-4">
          <Button
            label="Resgatar recompensa"
            loading={isClaiming}
            loadingLabel="Resgatando…"
            disabled={claimDisabled && !isClaiming}
            onPress={handleClaim}
          />
        </View>
      ) : null}

      {status === 'claimed' ? (
        <Pressable accessibilityRole="text" className="mt-3">
          <Text className="text-center text-xs text-muted">Recompensa já resgatada</Text>
        </Pressable>
      ) : null}
    </Card>
  );
};
