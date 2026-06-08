import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import type { PetMemoryRecord } from '@/types/pet-expansion';

import { PET_MEMORY_DEFINITIONS } from '../catalogs/pet-dialogues-catalog';
import { PetMemoryService } from '../services/pet-memory-service';

export const PetMemoriesSection = () => {
  const [memories, setMemories] = useState<PetMemoryRecord[]>([]);

  useEffect(() => {
    void PetMemoryService.getMemories().then(setMemories);
  }, []);

  const unlockedKeys = new Set(memories.map((item) => item.memoryKey));

  return (
    <Card elevated>
      <Text className="mb-1  font-semibold text-foreground">Álbum de memórias</Text>
      <Text className="mb-3 text-xs leading-relaxed text-foreground-secondary">
        Memórias da sua conta — não resetam ao trocar de pet. Compartilhadas com o companheiro atual.
      </Text>
      <View className="gap-2">
        {PET_MEMORY_DEFINITIONS.map((definition) => {
          const unlocked = unlockedKeys.has(definition.key);
          const record = memories.find((item) => item.memoryKey === definition.key);

          return (
            <View
              key={definition.key}
              className={`flex-row items-center gap-3 rounded-xl border px-3 py-3 ${
                unlocked ? 'border-accent/40 bg-accent/5' : 'border-border bg-surface opacity-60'
              }`}>
              <Text className="text-2xl">{unlocked ? definition.icon : '🔒'}</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {unlocked ? definition.title : '???'}
                </Text>
                <Text className="text-xs text-muted">
                  {unlocked ? definition.description : 'Continue a jornada para desbloquear'}
                </Text>
                {record ? (
                  <Text className="mt-1 text-[10px] text-muted">
                    {new Date(record.unlockedAt).toLocaleDateString('pt-BR')}
                  </Text>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
};
