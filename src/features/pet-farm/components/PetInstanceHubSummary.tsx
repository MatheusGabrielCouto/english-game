import { Text, View } from 'react-native';

import { Card } from '@/components';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getPetXPProgress } from '@/features/pet/utils/xp';
import type { PetInstance } from '@/types/pet-instance';

type PetInstanceHubSummaryProps = {
  instance: PetInstance;
};

export const PetInstanceHubSummary = ({ instance }: PetInstanceHubSummaryProps) => {
  const xp = getPetXPProgress(instance.level, instance.experience);

  return (
    <Card className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-foreground">Progresso</Text>
        <Text className="text-xs text-muted">
          Nv. {instance.level} · {xp.current}/{xp.required} XP
        </Text>
      </View>
      <ProgressBar value={xp.current} max={xp.required} variant="xp" animated height="md" />
    </Card>
  );
};
