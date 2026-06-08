import { useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, type TouchableOpacityProps } from 'react-native';

import { BUTTON_HAPTIC_BY_VARIANT, TOUCH_TARGET_MIN_CLASS, theme } from '@/constants';

import { cn, guardPress } from '@/utils';
import { playHaptic } from '@/utils/haptics';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  textClassName?: string;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-muted',
  secondary: 'bg-surface-elevated border border-border active:opacity-80',
  ghost: 'bg-transparent active:bg-surface-elevated',
  danger: 'bg-danger active:opacity-80',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2.5',
  md: 'px-5 py-3.5',
  lg: 'px-6 py-4',
};

const textVariantStyles: Record<ButtonVariant, string> = {
  primary: 'text-foreground font-semibold',
  secondary: 'text-foreground font-medium',
  ghost: 'text-foreground-secondary font-medium',
  danger: 'text-foreground font-semibold',
};

const textSizeStyles: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: '',
  lg: 'text-lg',
};

export const Button = ({
  label,
  loading = false,
  loadingLabel,
  variant = 'primary',
  size = 'md',
  className,
  textClassName,
  disabled,
  style: styleProp,
  accessibilityRole = 'button',
  onPress,
  onPressIn,
  ...props
}: ButtonProps) => {
  const guardedOnPress = useMemo(() => guardPress(onPress), [onPress]);
  const isDisabled = disabled || loading;
  const displayLabel = loading ? (loadingLabel ?? label) : label;
  const spinnerColor = variant === 'secondary' || variant === 'ghost' ? theme.colors.primary : theme.colors.foreground;

  return (
  <TouchableOpacity
    accessibilityRole={accessibilityRole}
    accessibilityLabel={displayLabel}
    accessibilityState={{ disabled: !!isDisabled, busy: loading }}
    disabled={isDisabled}
    activeOpacity={0.8}
    onPress={guardedOnPress}
    onPressIn={(event) => {
      if (!isDisabled) playHaptic(BUTTON_HAPTIC_BY_VARIANT[variant]);
      onPressIn?.(event);
    }}
    className={cn(
      'rounded-xl items-center justify-center',
      TOUCH_TARGET_MIN_CLASS,
      variantStyles[variant],
      sizeStyles[size],
      isDisabled && 'opacity-50',
      className,
    )}
    style={[
      variant === 'primary' && {
        shadowColor: '#8b5cf6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
      },
      styleProp,
    ]}
    {...props}>
    <View className="flex-row items-center justify-center gap-2">
      {loading ? <ActivityIndicator size="small" color={spinnerColor} /> : null}
      <Text className={cn(textVariantStyles[variant], textSizeStyles[size], textClassName)}>
        {displayLabel}
      </Text>
    </View>
  </TouchableOpacity>
  );
};
