import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { theme } from '@/constants';

const COLORS = [
  theme.colors.primary,
  theme.colors.accent,
  theme.colors.gold,
  theme.colors.success,
  theme.colors.legendary,
  theme.colors.epic,
];

type ParticleProps = {
  index: number;
  active: boolean;
};

const Particle = ({ index, active }: ParticleProps) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  const startX = ((index * 37) % 100) - 50;
  const delay = (index % 12) * 40;
  const color = COLORS[index % COLORS.length];

  useEffect(() => {
    if (!active) {
      opacity.value = 0;
      return;
    }

    translateX.value = startX;
    translateY.value = -20;
    rotate.value = 0;
    opacity.value = 0;

    opacity.value = withDelay(delay, withTiming(1, { duration: 150 }));
    translateY.value = withDelay(
      delay,
      withTiming(420 + (index % 5) * 30, { duration: 2200, easing: Easing.out(Easing.quad) }),
    );
    translateX.value = withDelay(
      delay,
      withTiming(startX + ((index % 2 === 0 ? 1 : -1) * (20 + (index % 8) * 6)), {
        duration: 2200,
      }),
    );
    rotate.value = withDelay(
      delay,
      withTiming(360 * (index % 2 === 0 ? 1 : -1), { duration: 2200 }),
    );
    opacity.value = withDelay(delay + 1600, withTiming(0, { duration: 600 }));
  }, [active, delay, index, opacity, rotate, startX, translateX, translateY]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        style,
        {
          backgroundColor: color,
          left: `${10 + (index * 7) % 80}%`,
        },
      ]}
    />
  );
};

type ConfettiProps = {
  active: boolean;
  count?: number;
};

export const Confetti = ({ active, count = 24 }: ConfettiProps) => {
  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: count }, (_, index) => (
        <Particle key={index} index={index} active={active} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 200,
    elevation: 200,
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    top: 0,
    width: 8,
    height: 12,
    borderRadius: 2,
  },
});
