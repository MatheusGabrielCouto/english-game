import { type ReactNode, useMemo } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import { AudioDirector } from '@/services/audio';
import { haptics } from '@/utils/haptics';
import { guardPress } from '@/utils/press-guard';

type PressableScaleProps = PressableProps & {
  children: ReactNode;
  scale?: number;
  className?: string;
  /** When true, inner content stretches (full-width cards). Default false for chips/pills in flex-row. */
  fill?: boolean;
};

export const PressableScale = ({
  children,
  scale = 0.96,
  className,
  fill = false,
  style,
  onPress,
  onPressIn,
  onPressOut,
  disabled,
  ...props
}: PressableScaleProps) => {
  const guardedOnPress = useMemo(() => guardPress(onPress), [onPress]);
  const pressed = useSharedValue(1);

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
        if (!disabled) {
          queueMicrotask(() => {
            haptics.selection();
            AudioDirector.playUI('ui_tap_soft');
          });
        }
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        pressed.value = withSpring(1, { damping: 15, stiffness: 300 });
        onPressOut?.(event);
      }}>
      <Animated.View
        className={fill ? 'w-full flex-1 self-stretch' : 'flex-shrink-0'}
        style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
};
