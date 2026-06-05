import { Text, View } from 'react-native';

import { PressableScale } from '@/components/ui/game';
import type { PetInstance } from '@/types/pet-instance';
import { cn } from '@/utils';

import { computeTraitRerollCoinCost } from '../constants/pet-trait-balance';
import { PET_TRAIT_UI } from '../constants/pet-trait-ui';
import { PetTraitRollService } from '../services/pet-trait-roll-service';
import { PetTraitService } from '../services/pet-trait-service';

type PetTraitChipsProps = {
  instance: PetInstance;
  onRerolled?: () => void;
};

export const PetTraitChips = ({ instance, onRerolled }: PetTraitChipsProps) => {
  const maxSlots = PetTraitRollService.slotCountForSpecies(instance.speciesKey);
  const slotCost = computeTraitRerollCoinCost(instance.generation);
  const allCost = slotCost * 2;

  const handleRerollSlot = async (index: number) => {
    const result = await PetTraitService.rerollSlotWithCoins(instance.id, index);
    if (result.ok) onRerolled?.();
  };

  const handleRerollAll = async () => {
    const result = await PetTraitService.rerollAllWithCoins(instance.id);
    if (result.ok) onRerolled?.();
  };

  const keys = instance.traitKeys;
  const displaySlots = Array.from({ length: maxSlots }, (_, i) => keys[i] ?? null);

  return (
    <View className="gap-3">
      <Text className="text-sm font-bold text-foreground">{PET_TRAIT_UI.title}</Text>

      <View className="flex-row flex-wrap gap-2">
        {displaySlots.map((traitKey, index) => {
          if (!traitKey) {
            return (
              <View
                key={`empty-${index}`}
                className="rounded-full border border-dashed border-border px-3 py-1.5">
                <Text className="text-[10px] text-muted">Slot vazio</Text>
              </View>
            );
          }
          const chip = PetTraitService.formatTraitChip(traitKey);
          return (
            <PressableScale
              key={`${traitKey}-${index}`}
              onPress={() => void handleRerollSlot(index)}
              accessibilityRole="button"
              accessibilityLabel={`${chip.name}. ${PET_TRAIT_UI.rerollSlot}`}
              className={cn(
                'max-w-full rounded-full border px-3 py-1.5',
                chip.isNegative
                  ? 'border-red-500/40 bg-red-950/25'
                  : 'border-emerald-500/35 bg-emerald-950/20',
              )}>
              <Text
                className={cn(
                  'text-[10px] font-bold',
                  chip.isNegative ? 'text-red-300' : 'text-emerald-200',
                )}
                numberOfLines={1}>
                {chip.name}
              </Text>
              <Text className="text-[9px] text-muted" numberOfLines={2}>
                {chip.description || PET_TRAIT_UI.futureTrait}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <View className="flex-row flex-wrap gap-2">
        <PressableScale
          onPress={() => void handleRerollAll()}
          className="rounded-lg border border-border px-3 py-2"
          accessibilityRole="button">
          <Text className="text-[10px] font-bold text-foreground">
            {PET_TRAIT_UI.rerollAllCoins(allCost)}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
};
