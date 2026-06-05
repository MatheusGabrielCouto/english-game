import { type ReactNode, useMemo } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { GAME_CARD_PRESS_SPRING } from '@/constants/game-card-press-ui';
import type { HapticKind } from '@/constants/haptic-vocabulary';
import { PRESSABLE_SCALE_DEFAULT_HAPTIC } from '@/constants/haptic-vocabulary';
import { AudioDirector } from '@/services/audio';
import { playHaptic } from '@/utils/haptics';
import { guardPress } from '@/utils/press-guard';

import { GameCardPressProvider } from './GameCardPressContext';

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  scale?: number;
  className?: string;
  /** When true, inner content stretches (full-width cards). Default false for chips/pills in flex-row. */
  fill?: boolean;
  /** Semantic haptic on press-in. `false` disables (use when firing a custom haptic in `onPress`). */
  haptic?: HapticKind | false;
};

export const PressableScale = ({
  children,
  scale = 0.96,
  className,
  fill = false,
  haptic = PRESSABLE_SCALE_DEFAULT_HAPTIC,
  style,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableScaleProps) => {
  const guardedOnPress = useMemo(() => guardPress(onPress), [onPress]);
  const pressed = useSharedValue(1);
  const pressGlowIntensity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressed.value }],
  }));

  return (
    <Pressable
      {...props}
      onPress={guardedOnPress}
      disabled={disabled}
      className={className}
      style={style as StyleProp<ViewStyle>}
      onPressIn={(event) => {
        pressed.value = withSpring(scale, { damping: 15, stiffness: 300 });
        pressGlowIntensity.value = withSpring(1, GAME_CARD_PRESS_SPRING);
        if (!disabled && haptic !== false) {
          queueMicrotask(() => {
            playHaptic(haptic);
            AudioDirector.playUI('ui_tap_soft');
          });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(1, { damping: 15, stiffness: 300 });
        pressGlowIntensity.value = withSpring(0, GAME_CARD_PRESS_SPRING);
        onPressOut?.(event);
      }}>
      <GameCardPressProvider intensity={pressGlowIntensity}>
        <Animated.View
          className={fill ? 'w-full flex-1 self-stretch' : 'flex-shrink-0'}
          style={animatedStyle}>
          {children}
        </Animated.View>
      </GameCardPressProvider>
    </Pressable>
  );
};
