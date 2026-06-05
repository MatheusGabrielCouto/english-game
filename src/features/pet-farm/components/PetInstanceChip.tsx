import { Pressable, Text, View, type ViewStyle } from 'react-native';

import { PET_FAVORITE_TAG_ICONS } from '@/types/pet-instance';
import type { PetInstance } from '@/types/pet-instance';
import { TOUCH_TARGET_MIN_CLASS } from '@/constants/touch-target-ui';
import { cn } from '@/utils';

import { PetStatsService } from '../services/pet-stats-service';
import { PetGenBadge } from './PetGenBadge';
import { PetGenderBadge } from './PetGenderBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

/** Evita className com shadow/opacity no Pressable — race NativeWind + Expo Router. */
const CHIP_SELECTED_BG: ViewStyle = {
  backgroundColor: 'rgba(139, 92, 246, 0.14)',
};

type PetInstanceChipProps = {
  instance: PetInstance;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
};

export const PetInstanceChip = ({
  instance,
  selected,
  onPress,
  compact,
}: PetInstanceChipProps) => {
  const passiveLabel = PetStatsService.formatPassiveLabel(instance.speciesKey, instance.stats);

  const content = (
    <View
      className={cn(
        'items-center rounded-2xl border-2 p-2.5',
        compact ? 'min-w-[76px]' : 'min-w-[92px]',
        selected ? 'border-primary' : 'border-border bg-surface',
        instance.isActive && !selected && 'border-glow',
      )}
      style={selected ? CHIP_SELECTED_BG : undefined}>
      <View className="flex-row items-center gap-1">
        <PetSpeciesIcon speciesKey={instance.speciesKey} size={compact ? 26 : 30} />
        <PetGenderBadge gender={instance.gender} />
        {!compact ? <PetGenBadge generation={instance.generation} size="sm" /> : null}
      </View>
      <Text className="mt-1.5 text-center text-[10px] font-bold text-foreground" numberOfLines={1}>
        {instance.favoriteTag !== 'none'
          ? `${PET_FAVORITE_TAG_ICONS[instance.favoriteTag]} ${instance.nickname}`
          : instance.nickname}
      </Text>
      {!compact ? (
        <Text className="text-center text-[9px] text-muted" numberOfLines={1}>
          Nv.{instance.level} · {passiveLabel}
        </Text>
      ) : (
        <Text className="text-center text-[8px] font-bold text-primary" numberOfLines={1}>
          {passiveLabel}
        </Text>
      )}
      {instance.isActive ? (
        <View
          className="mt-1 rounded-full px-1.5 py-0.5"
          style={{ backgroundColor: 'rgba(139, 92, 246, 0.2)' }}>
          <Text className="text-[7px] font-bold text-primary">★ Ativo</Text>
        </View>
      ) : null}
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={instance.nickname}
      className={TOUCH_TARGET_MIN_CLASS}
      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] })}>
      {content}
    </Pressable>
  );
};
