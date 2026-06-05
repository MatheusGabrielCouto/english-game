import { useCallback, useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/utils';

type ToastProps = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
  variant?: 'success' | 'info' | 'warning' | 'error';
  /** Changes when a new toast is shown; keeps the dismiss timer from resetting on parent re-renders. */
  toastKey?: string | number;
};

const VARIANT_STYLES: Record<NonNullable<ToastProps['variant']>, string> = {
  success: 'border-success/40 bg-success/20',
  info: 'border-primary/40 bg-primary/20',
  warning: 'border-warning/40 bg-warning/15',
  error: 'border-danger/40 bg-danger/15',
};

const ENTER_OFFSET = -20;
const EXIT_OFFSET = -12;
const ENTER_DURATION_MS = 200;
const EXIT_DURATION_MS = 180;

export const Toast = ({
  message,
  onDismiss,
  durationMs = 3000,
  variant = 'success',
  toastKey,
}: ToastProps) => {
  const insets = useSafeAreaInsets();
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const displayRef = useRef<string | null>(null);
  const isExitingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [displayVariant, setDisplayVariant] = useState(variant);

  const translateY = useSharedValue(ENTER_OFFSET);
  const opacity = useSharedValue(0);

  const finishDismiss = useCallback(() => {
    isExitingRef.current = false;
    displayRef.current = null;
    setDisplayMessage(null);
    onDismissRef.current();
  }, []);

  const runExit = useCallback(() => {
    if (isExitingRef.current || !displayRef.current) return;

    isExitingRef.current = true;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    translateY.value = withTiming(EXIT_OFFSET, { duration: EXIT_DURATION_MS });
    opacity.value = withTiming(0, { duration: EXIT_DURATION_MS }, (finished) => {
      if (finished) runOnJS(finishDismiss)();
    });
  }, [finishDismiss, opacity, translateY]);

  const runEnter = useCallback(() => {
    isExitingRef.current = false;
    translateY.value = ENTER_OFFSET;
    opacity.value = 0;
    translateY.value = withSpring(0, { damping: 20, stiffness: 280 });
    opacity.value = withTiming(1, { duration: ENTER_DURATION_MS });
  }, [opacity, translateY]);

  useEffect(() => {
    if (!message) {
      if (displayRef.current) runExit();
      return;
    }

    displayRef.current = message;
    setDisplayMessage(message);
    setDisplayVariant(variant);
    runEnter();

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => runExit(), durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [message, durationMs, toastKey, variant, runEnter, runExit]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!displayMessage) return null;

  return (
    <Animated.View
      style={[{ top: insets.top + 12 }, animatedStyle]}
      className="absolute left-4 right-4 z-50"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <Animated.View
        className={cn(
          'rounded-xl border px-4 py-3 shadow-lg',
          VARIANT_STYLES[displayVariant],
        )}>
        <Text className="text-center text-sm font-medium text-foreground">{displayMessage}</Text>
      </Animated.View>
    </Animated.View>
  );
};
