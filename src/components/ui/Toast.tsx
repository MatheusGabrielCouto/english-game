import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
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

  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => onDismissRef.current(), durationMs);
    return () => clearTimeout(timer);
  }, [message, durationMs, toastKey]);

  if (!message) return null;

  return (
    <View
      className="absolute left-4 right-4 z-50"
      style={{ top: insets.top + 12 }}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <View
        className={cn(
          'rounded-xl border px-4 py-3 shadow-lg',
          VARIANT_STYLES[variant],
        )}>
        <Text className="text-center text-sm font-medium text-foreground">{message}</Text>
      </View>
    </View>
  );
};
