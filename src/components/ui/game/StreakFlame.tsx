import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AppIcon } from '@/components/ui/AppIcon';
import { theme } from '@/constants';
import { cn } from '@/utils';

type StreakFlameProps = {
  streak: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
};

export const StreakFlame = ({ streak, size = 24, showLabel = false, className }: StreakFlameProps) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (streak <= 0) {
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withSequence(withTiming(1.15, { duration: 600 }), withTiming(1, { duration: 600 })),
      -1,
      false,
    );
  }, [pulse, streak]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <Animated.View style={animatedStyle}>
        <AppIcon
          name="flame"
          size={size}
          color={streak > 0 ? theme.colors.streak : theme.colors.muted}
        />
      </Animated.View>
      {showLabel ? (
        <Text className="text-lg font-black text-streak">
          {streak} {streak === 1 ? 'dia' : 'dias'}
        </Text>
      ) : null}
    </View>
  );
};
