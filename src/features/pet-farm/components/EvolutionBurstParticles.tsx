import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming
} from 'react-native-reanimated';

import { theme } from '@/constants';

const BURST_COLORS = [
  theme.colors.primary,
  theme.colors.gold,
  theme.colors.legendary,
  theme.colors.accent,
  theme.colors.success,
];

type BurstParticleProps = {
  index: number;
  active: boolean;
};

const BurstParticle = ({ index, active }: BurstParticleProps) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);
  const angle = (index / 16) * Math.PI * 2;
  const distance = 48 + (index % 5) * 18;
  const color = BURST_COLORS[index % BURST_COLORS.length];

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      opacity.value = 0;
      return;
    }

    progress.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    opacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withDelay(400, withTiming(0, { duration: 280 })),
    );
  }, [active, opacity, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: Math.cos(angle) * distance * progress.value },
      { translateY: Math.sin(angle) * distance * progress.value },
      { scale: 0.4 + progress.value * 0.9 },
    ],
  }));

  return (
    <Animated.View
      style={[
        style,
        {
          position: 'absolute',
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
        },
      ]}
    />
  );
};

type EvolutionBurstProps = {
  active: boolean;
};

export const EvolutionBurstParticles = ({ active }: EvolutionBurstProps) => (
  <View style={styles.burstHost} pointerEvents="none">
    {Array.from({ length: 16 }, (_, index) => (
      <BurstParticle key={index} index={index} active={active} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  burstHost: {
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
