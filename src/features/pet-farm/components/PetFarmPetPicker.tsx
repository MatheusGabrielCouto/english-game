import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { getPetXPProgress } from '@/features/pet/utils/xp';
import type { PetInstance } from '@/types/pet-instance';
import { cn } from '@/utils';

import { PET_PICKER_UI } from '../constants/pet-picker-ui';
import { PetStatsService } from '../services/pet-stats-service';
import { PetFarmEmptyState } from './PetFarmUiKit';
import { PetGenBadge } from './PetGenBadge';
import { PetGenderBadge } from './PetGenderBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

const SELECTED_ROW_BG: ViewStyle = { backgroundColor: 'rgba(139, 92, 246, 0.14)' };

type PetFarmPetPickerProps = {
  pets: PetInstance[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  emptyTitle?: string;
  emptySubtitle?: string;
};

const PetPickerRow = ({
  pet,
  selected,
  onPress,
}: {
  pet: PetInstance;
  selected: boolean;
  onPress: () => void;
}) => {
  const passiveLabel = PetStatsService.formatPassiveLabel(pet.speciesKey, pet.stats);
  const xp = getPetXPProgress(pet.level, pet.experience);

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border-2 px-3 py-3',
        selected ? 'border-primary' : 'border-border bg-surface',
      )}
      style={selected ? SELECTED_ROW_BG : undefined}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`${pet.nickname}, ${PET_PICKER_UI.levelGen(pet.level, pet.generation)}`}>
      <View
        className={cn(
          'h-14 w-14 items-center justify-center rounded-2xl border',
          selected ? 'border-primary bg-surface-elevated' : 'border-border bg-surface-elevated',
        )}>
        <PetSpeciesIcon speciesKey={pet.speciesKey} size={44} />
      </View>

      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row flex-wrap items-center gap-1.5">
          <Text className="text-sm font-black text-foreground" numberOfLines={1}>
            {pet.nickname}
          </Text>
          <PetGenderBadge gender={pet.gender} />
          <PetGenBadge generation={pet.generation} size="sm" />
          {pet.isActive ? (
            <View
              className="rounded-full px-1.5 py-0.5"
              style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
              <Text className="text-[8px] font-bold text-primary">★</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-[10px] text-muted" numberOfLines={1}>
          {PET_PICKER_UI.levelGen(pet.level, pet.generation)} · {passiveLabel}
        </Text>
        {selected ? (
          <View className="gap-0.5">
            <View className="flex-row justify-between">
              <Text className="text-[9px] text-muted">XP</Text>
              <Text className="text-[9px] font-bold text-primary">
                {xp.current}/{xp.required}
              </Text>
            </View>
            <ProgressBar
              value={xp.percentage}
              max={100}
              height="sm"
              variant="xp"
              animated={false}
              accessibilityLabel={`XP ${Math.round(xp.percentage)}%`}
            />
          </View>
        ) : null}
      </View>

      <View
        className={cn(
          'h-6 w-6 items-center justify-center rounded-full border-2',
          selected ? 'border-primary bg-primary' : 'border-border bg-surface',
        )}>
        {selected ? <Text className="text-[10px] font-bold text-background">✓</Text> : null}
      </View>
    </Pressable>
  );
};

export const PetFarmPetPicker = ({
  pets,
  selectedId,
  onSelect,
  emptyTitle = PET_PICKER_UI.emptyTitle,
  emptySubtitle,
}: PetFarmPetPickerProps) => {
  if (pets.length === 0) {
    return <PetFarmEmptyState emoji="🐾" title={emptyTitle} subtitle={emptySubtitle} />;
  }

  return (
    <View className="gap-2">
      <Text className="text-[10px] font-bold text-muted">{PET_PICKER_UI.count(pets.length)}</Text>
      {pets.map((pet) => (
        <PetPickerRow
          key={pet.id}
          pet={pet}
          selected={pet.id === selectedId}
          onPress={() => onSelect(pet.id)}
        />
      ))}
    </View>
  );
};
