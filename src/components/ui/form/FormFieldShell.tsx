import { type ReactNode, useEffect, useId, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'

import { cn } from '@/utils'

import { resolveFormFieldErrorId } from './form-field-a11y'
import { useFormFieldShake } from './useFormFieldShake'

type FormFieldShellProps = {
  label: string
  hint?: string
  error?: string | null
  fieldId?: string
  footer?: string | null
  footerTone?: 'muted' | 'success' | 'danger'
  children: ReactNode
  showClear?: boolean
  onClear?: () => void
  className?: string
  labelClassName?: string
  centerLabel?: boolean
}

const footerToneClass = {
  muted: 'text-muted',
  success: 'text-success',
  danger: 'text-danger',
} as const

export const FormFieldShell = ({
  label,
  hint,
  error,
  fieldId,
  footer,
  footerTone = 'muted',
  children,
  showClear,
  onClear,
  className,
  labelClassName,
  centerLabel = false,
}: FormFieldShellProps) => {
  const generatedId = useId().replace(/:/g, '')
  const resolvedFieldId = fieldId ?? `field-${generatedId}`
  const errorId = resolveFormFieldErrorId(resolvedFieldId)
  const { animatedStyle, triggerShake } = useFormFieldShake()
  const previousError = useRef<string | null>(null)

  useEffect(() => {
    if (error && error !== previousError.current) {
      triggerShake()
    }
    previousError.current = error ?? null
  }, [error, triggerShake])

  return (
    <View className={cn('w-full', className)}>
      <Text
        className={cn(
          'font-semibold text-foreground',
          centerLabel ? 'text-center text-xs' : 'text-sm',
          labelClassName,
        )}
        nativeID={`${resolvedFieldId}-label`}
        numberOfLines={centerLabel ? 1 : undefined}>
        {label}
      </Text>
      {hint ? (
        <Text className="mt-1 text-xs leading-4 text-foreground-secondary">{hint}</Text>
      ) : null}

      <Animated.View className={cn('w-full', centerLabel ? 'mt-1.5' : 'mt-2')} style={animatedStyle}>
        {showClear && onClear ? (
          <View className="flex-row items-start gap-2">
            <View className="flex-1">{children}</View>
            <Pressable
              className="h-12 min-w-[48px] items-center justify-center rounded-xl border border-border bg-surface"
              onPress={onClear}
              accessibilityRole="button"
              accessibilityLabel="Limpar campo">
              <Text className="text-base font-bold text-muted">✕</Text>
            </Pressable>
          </View>
        ) : (
          children
        )}
      </Animated.View>

      {error ? (
        <Text
          nativeID={errorId}
          className={cn('text-danger', centerLabel ? 'mt-1 text-[10px] leading-3' : 'mt-1.5 text-xs')}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          numberOfLines={centerLabel ? 2 : undefined}>
          {error}
        </Text>
      ) : null}
      {!error && footer ? (
        <Text className={cn('mt-1.5 text-xs', footerToneClass[footerTone])}>{footer}</Text>
      ) : null}
    </View>
  )
}
