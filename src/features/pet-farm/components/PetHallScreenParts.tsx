import { useEffect } from 'react';
import { Pressable, Text, View, type ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import type { PetHallPedestal } from '@/types/pet-hall';
import { cn } from '@/utils';

import { PET_HALL_UI } from '../constants/pet-hall-ui';
import { PetGenBadge } from './PetGenBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

const PEDESTAL_BG: ViewStyle = { backgroundColor: 'rgba(245, 158, 11, 0.08)' };
const EMPTY_BG: ViewStyle = { backgroundColor: 'rgba(255, 255, 255, 0.03)' };

type PedestalCardProps = {
  pedestal: PetHallPedestal;
  onInductSuggested?: () => void;
  onRemove?: () => void;
};

export const PetHallPedestalCard = ({
  pedestal,
  onInductSuggested,
  onRemove,
}: PedestalCardProps) => {
  const bounce = useSharedValue(0);
  const display = pedestal.instance ?? pedestal.suggestedInstance;
  const isOfficial = pedestal.instance !== null;

  useEffect(() => {
    if (!display) return;
    bounce.value = withRepeat(
      withSequence(withTiming(-6, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [bounce, display?.id]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <View
      className={cn(
        'gap-2 rounded-2xl border p-3',
        isOfficial ? 'border-amber-500/40' : 'border-border border-dashed',
      )}
      style={isOfficial ? PEDESTAL_BG : EMPTY_BG}>
      <View className="flex-row items-center gap-2">
        <Text className="">{pedestal.categoryEmoji}</Text>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-wide text-muted">
            {pedestal.categoryLabel}
          </Text>
          {display ? (
            <Text className="text-xs font-bold text-foreground">{display.nickname}</Text>
          ) : (
            <Text className="text-xs text-muted">{PET_HALL_UI.emptyPedestal}</Text>
          )}
        </View>
        {isOfficial ? (
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={PET_HALL_UI.clearSlot}
            className="rounded-lg border border-border px-2 py-1">
            <Text className="text-[9px] font-bold text-muted">{PET_HALL_UI.clearSlot}</Text>
          </Pressable>
        ) : null}
      </View>

      <View className="items-center py-2">
        {display ? (
          <Animated.View style={animatedStyle} className="items-center gap-1">
            <PetSpeciesIcon speciesKey={display.speciesKey} size={56} />
            <PetGenBadge generation={display.generation} size="sm" />
          </Animated.View>
        ) : (
          <Text className="text-3xl opacity-40">🏛️</Text>
        )}
      </View>

      <Text className="text-center text-[10px] text-muted">{pedestal.metricLabel}</Text>

      {!isOfficial && pedestal.suggestedInstance && onInductSuggested ? (
        <Pressable
          onPress={onInductSuggested}
          accessibilityRole="button"
          accessibilityLabel={PET_HALL_UI.induct}
          className="items-center rounded-xl bg-amber-600/90 py-2"
          style={{ opacity: 1 }}>
          <Text className="text-[10px] font-black text-white">{PET_HALL_UI.induct}</Text>
        </Pressable>
      ) : null}

      {!isOfficial && pedestal.suggestedInstance ? (
        <Text className="text-center text-[9px] text-amber-300/80">
          {PET_HALL_UI.suggested(pedestal.suggestedInstance.nickname)}
        </Text>
      ) : null}
    </View>
  );
};
