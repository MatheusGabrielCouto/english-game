import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { cn } from '@/utils';

import { ROUTINE_UI } from '../constants/routine-ui';

type RoutineFieldShellProps = {
  label: string;
  hint?: string;
  error?: string | null;
  footer?: string | null;
  footerTone?: 'muted' | 'success' | 'danger';
  children: ReactNode;
  showClear?: boolean;
  onClear?: () => void;
  className?: string;
};

export const routineInputBorderClass = (hasError: boolean): string =>
  hasError ? 'border-danger' : 'border-border';

const footerToneClass = {
  muted: 'text-muted',
  success: 'text-success',
  danger: 'text-danger',
} as const;

export const RoutineFieldShell = ({
  label,
  hint,
  error,
  footer,
  footerTone = 'muted',
  children,
  showClear,
  onClear,
  className,
}: RoutineFieldShellProps) => (
  <View className={cn('w-full', className)}>
    <Text className="text-sm font-semibold text-foreground">{label}</Text>
    {hint ? (
      <Text className="mt-1 text-xs leading-4 text-foreground-secondary">{hint}</Text>
    ) : null}

    <View className="mt-2 w-full">
      {showClear && onClear ? (
        <View className="flex-row items-start gap-2">
          <View className="flex-1">{children}</View>
          <Pressable
            className="h-12 min-w-[48px] items-center justify-center rounded-xl border border-border bg-surface"
            onPress={onClear}
            accessibilityRole="button"
            accessibilityLabel={ROUTINE_UI.fieldClear}>
            <Text className="text-base font-bold text-muted">✕</Text>
          </Pressable>
        </View>
      ) : (
        children
      )}
    </View>

    {error ? (
      <Text className="mt-1.5 text-xs text-danger" accessibilityLiveRegion="polite">
        {error}
      </Text>
    ) : null}
    {!error && footer ? (
      <Text className={cn('mt-1.5 text-xs', footerToneClass[footerTone])}>{footer}</Text>
    ) : null}
  </View>
);
