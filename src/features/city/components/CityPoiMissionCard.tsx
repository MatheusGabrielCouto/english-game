import { Text, View } from 'react-native';

import { Button, Card, ProgressBar } from '@/components';
import type { CityPoiMission } from '@/types/city-poi-mission';
import { getPoiMissionStatus } from '@/types/city-poi-mission';
import { cn } from '@/utils';

type CityPoiMissionCardProps = {
  mission: CityPoiMission;
  onClaim: (id: string) => void | Promise<void>;
  isClaiming?: boolean;
  claimDisabled?: boolean;
};

const statusLabels = {
  in_progress: 'Em progresso',
  completed: 'Pronta',
  claimed: 'Resgatada',
} as const;

const statusStyles = {
  in_progress: 'bg-surface-elevated text-foreground-secondary',
  completed: 'bg-primary/25 text-primary',
  claimed: 'bg-success/20 text-success',
} as const;

export const CityPoiMissionCard = ({
  mission,
  onClaim,
  isClaiming = false,
  claimDisabled = false,
}: CityPoiMissionCardProps) => {
  const status = getPoiMissionStatus(mission);
  const canClaim = status === 'completed';

  const handleClaim = () => {
    if (!canClaim || isClaiming || claimDisabled) return;
    void onClaim(mission.id);
  };

  return (
    <Card className={cn(status === 'claimed' && 'opacity-90')} elevated>
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

      <View className="mt-3 flex-row flex-wrap gap-3">
        <Text className="text-xs font-medium text-primary">+{mission.xpReward} XP</Text>
        <Text className="text-xs font-medium text-accent">+{mission.coinReward} moedas</Text>
        <Text className="text-xs font-medium text-glow">+{mission.localXpReward} XP local</Text>
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
        <Text className="mt-3 text-center text-xs text-muted">Recompensa resgatada</Text>
      ) : null}
    </Card>
  );
};
