import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { ListItemSkeleton } from '@/components/ui/skeleton';
import { PetInstanceRepository } from '@/storage/repositories/pet-instance-repository';
import type { PetInstanceMemoryRecord } from '@/types/pet-instance-memory';

import { PET_TIMELINE_UI } from '../constants/pet-timeline-ui';
import { PetInstanceMemoryService } from '../services/pet-instance-memory-service';
import { groupTimelineItems } from '../utils/timeline-group';

type PetInstanceTimelineScreenContentProps = {
  instanceId: number;
};

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const PetInstanceTimelineScreenContent = ({
  instanceId,
}: PetInstanceTimelineScreenContentProps) => {
  const [nickname, setNickname] = useState('');
  const [memories, setMemories] = useState<PetInstanceMemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const instance = await PetInstanceRepository.findById(instanceId);
    setNickname(instance?.nickname ?? '');
    const rows = await PetInstanceMemoryService.getMemories(instanceId);
    setMemories(rows);
    setLoading(false);
  }, [instanceId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View className="gap-3 py-4">
        <ListItemSkeleton />
        <ListItemSkeleton />
        <ListItemSkeleton />
      </View>
    );
  }

  const groups = groupTimelineItems(memories);

  if (groups.length === 0) {
    return (
      <Card className="py-8">
        <Text className="text-center text-sm text-muted">{PET_TIMELINE_UI.empty}</Text>
      </Card>
    );
  }

  return (
    <View className="gap-4 pb-8">
      <Text className="text-xs text-muted">
        {nickname ? `${nickname} · ` : ''}
        {PET_TIMELINE_UI.count(memories.length)}
      </Text>

      {groups.map((group) => (
        <View key={group.key} className="gap-3">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted">
            {group.label}
          </Text>
          <View className="gap-0">
            {group.items.map((memory, index) => (
              <TimelineRow
                key={`${memory.memoryKey}-${memory.unlockedAt}`}
                memory={memory}
                isLast={index === group.items.length - 1}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const TimelineRow = ({
  memory,
  isLast,
}: {
  memory: PetInstanceMemoryRecord;
  isLast: boolean;
}) => (
  <View className="flex-row gap-3">
    <View className="items-center">
      <View className="h-9 w-9 items-center justify-center rounded-full border border-primary/40 bg-primary/10">
        <Text className="text-base">{memory.icon}</Text>
      </View>
      {!isLast ? <View className="mt-1 w-0.5 flex-1 bg-border" /> : null}
    </View>
    <View className={`flex-1 gap-0.5 ${isLast ? 'pb-0' : 'pb-4'}`}>
      <Text className="text-sm font-bold text-foreground">{memory.title}</Text>
      <Text className="text-xs leading-relaxed text-muted">{memory.description}</Text>
      <Text className="text-[10px] text-muted/80">{formatTime(memory.unlockedAt)}</Text>
    </View>
  </View>
);
