import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { routes } from '@/constants';

import { PET_TIMELINE_UI } from '../constants/pet-timeline-ui';
import { PetInstanceMemoryService } from '../services/pet-instance-memory-service';

type PetInstanceMemoriesCardProps = {
  instanceId: number;
};

export const PetInstanceMemoriesCard = ({ instanceId }: PetInstanceMemoriesCardProps) => {
  const router = useRouter();
  const [count, setCount] = useState(0);

  useEffect(() => {
    void PetInstanceMemoryService.getMemories(instanceId).then((rows) => setCount(rows.length));
  }, [instanceId]);

  return (
    <Card className="gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-foreground">{PET_TIMELINE_UI.title}</Text>
        <Text className="text-xs text-muted">{PET_TIMELINE_UI.count(count)}</Text>
      </View>
      <Text className="text-xs leading-relaxed text-muted">
        Milestones for this pet only — breeding, evolution, and lineage moments.
      </Text>
      <PressableScale
        onPress={() => router.push(`${routes.petFarmInstance}/${instanceId}/timeline` as Href)}
        className="items-center rounded-xl border border-primary/30 bg-primary/10 py-2.5"
        accessibilityRole="button"
        accessibilityLabel={PET_TIMELINE_UI.openTimeline}>
        <Text className="text-xs font-bold text-primary">{PET_TIMELINE_UI.openTimeline}</Text>
      </PressableScale>
    </Card>
  );
};
