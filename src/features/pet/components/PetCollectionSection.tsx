import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { cn } from '@/utils';

import { usePet } from '../hooks/use-pet';
import { PetCollectionService, type PetCollectionEntry } from '../services/pet-collection-service';

export const PetCollectionSection = () => {
  const { pet } = usePet();
  const [entries, setEntries] = useState<PetCollectionEntry[]>([]);

  const loadCollection = useCallback(async () => {
    const next = await PetCollectionService.getCollection(pet);
    setEntries(next);
  }, [pet]);

  useEffect(() => {
    void loadCollection();
  }, [loadCollection]);

  const discovered = entries.filter((item) => item.discovered && !item.isIncubating).length;

  return (
    <Card elevated>
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-foreground">Petédex</Text>
        <Text className="text-xs font-bold text-accent">
          {discovered}/{entries.length}
        </Text>
      </View>
      <Text className="mb-3 text-xs leading-relaxed text-foreground-secondary">
        Espécies descobertas aparecem após chocar. Seu pet ativo mostra a criatura — o estágio (Ovo, Filhote…) fica no texto.
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {entries.map((entry) => (
          <View
            key={entry.speciesKey}
            className={cn(
              'w-[30%] min-w-[100px] items-center rounded-2xl border px-2 py-3',
              entry.discovered
                ? entry.isActive
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-legendary/30 bg-legendary/5'
                : 'border-border bg-surface opacity-50',
            )}>
            <Text className="text-3xl">{entry.emoji}</Text>
            <Text className="mt-1 text-center text-[10px] font-semibold text-foreground" numberOfLines={1}>
              {entry.name}
            </Text>
            <Text className="text-center text-[9px] uppercase text-muted">{entry.rarity}</Text>
            {entry.isActive ? (
              <Text className="mt-1 text-center text-[9px] font-bold text-primary">
                {entry.isIncubating ? 'Incubando' : 'Ativo'}
              </Text>
            ) : entry.discovered ? (
              <Text className="mt-1 text-center text-[9px] text-foreground-secondary" numberOfLines={1}>
                {entry.subtitle}
              </Text>
            ) : null}
          </View>
        ))}
      </View>
    </Card>
  );
};
