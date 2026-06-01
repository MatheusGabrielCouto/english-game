import { Text, View } from 'react-native';

import { Button, Card, EmptyState } from '@/components';
import type { LootBoxRecord } from '@/types/inventory';

import { LOOT_BOX_RARITY_CONFIG } from '@/features/inventory/constants';

type LootBoxListProps = {
  boxes: LootBoxRecord[];
  isOpening: boolean;
  selectedBoxId: number | null;
  onOpen: (id: number) => void;
};

export const LootBoxList = ({ boxes, isOpening, selectedBoxId, onOpen }: LootBoxListProps) => {
  if (boxes.length === 0) {
    return (
      <EmptyState
        icon="gift-outline"
        title="Nenhuma loot box"
        description="Complete metas e mantenha sua sequência para ganhar caixas surpresa."
      />
    );
  }

  return (
    <View className="gap-3">
      {boxes.map((box) => {
        const config = LOOT_BOX_RARITY_CONFIG[box.rarity];
        const isSelected = selectedBoxId === box.id;

        return (
          <Card key={box.id} elevated>
            <View className="flex-row items-center gap-4">
              <Text className="text-3xl">{config.emoji}</Text>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">{config.label}</Text>
                <Text className="mt-0.5 text-xs text-muted">
                  Recebida em {new Date(box.acquiredAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Button
                label={isSelected && isOpening ? 'Abrindo...' : 'Abrir'}
                size="sm"
                onPress={() => onOpen(box.id)}
                disabled={isOpening}
              />
            </View>
          </Card>
        );
      })}
    </View>
  );
};
