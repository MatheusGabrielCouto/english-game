import { useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import Animated from 'react-native-reanimated'

import { getFormFieldInputA11y, resolveFormFieldErrorId } from '@/components/ui/form/form-field-a11y'
import { useFormFieldShake } from '@/components/ui/form/useFormFieldShake'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import { cn } from '@/utils'

import { ROUTINE_FORM_INPUT } from '../constants/routine-form-limits'
import { ROUTINE_UI } from '../constants/routine-ui'
import type { FieldValidation } from '../utils/routine-form-input'
import { maskDigitsInput } from '../utils/routine-form-input'

const SUFFIX_SLOT_WIDTH = 40
const CLEAR_BUTTON_SIZE = 40

type RoutineFormNumberFieldProps = {
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  validate: (value: string) => FieldValidation
  placeholder?: string
  maxDigits?: number
  suffix?: string
  optionalDefaultHint?: string
  forceShowError?: boolean
  compact?: boolean
  showClear?: boolean
}

export const RoutineFormNumberField = ({
  label,
  hint,
  value,
  onChange,
  validate,
  placeholder,
  maxDigits = 4,
  suffix,
  optionalDefaultHint,
  forceShowError = false,
  compact = false,
  showClear = true,
}: RoutineFormNumberFieldProps) => {
  const [touched, setTouched] = useState(false)
  const { animatedStyle, triggerShake } = useFormFieldShake()
  const previousError = useRef<string | null>(null)

  const validation = useMemo(() => validate(value), [validate, value])

  const showError =
    (forceShowError || touched) && !validation.valid && validation.error != null

  const showSuccess =
    !compact && touched && validation.valid && validation.normalized != null

  useEffect(() => {
    if (showError && validation.error && validation.error !== previousError.current) {
      triggerShake()
    }
    previousError.current = showError ? validation.error : null
  }, [showError, triggerShake, validation.error])

  const handleChange = (raw: string) => {
    onChange(maskDigitsInput(raw, maxDigits))
  }

  const handleClear = () => {
    setTouched(false)
    onChange('')
  }

  const resolvedHint = hint ?? (value.length === 0 ? optionalDefaultHint : undefined)
  const canClear = showClear && value.length > 0
  const fieldId = label.toLowerCase().replace(/\s+/g, '-')
  const errorId = resolveFormFieldErrorId(fieldId)

  return (
    <View className={cn('w-full', compact && 'flex-1')}>
      <Text
        className={cn(
          'font-semibold text-foreground',
          compact ? 'text-center text-xs' : 'text-sm',
        )}
        numberOfLines={1}>
        {label}
      </Text>
      {!compact && resolvedHint ? (
        <Text className="mt-1 text-xs leading-4 text-foreground-secondary">{resolvedHint}</Text>
      ) : null}

      <Animated.View className={cn('w-full', compact ? 'mt-1.5' : 'mt-2')} style={animatedStyle}>
        <View className="flex-row items-center gap-1.5">
          <View
            className={cn(
              'min-h-[48px] flex-1 flex-row items-center overflow-hidden rounded-xl border bg-surface',
              formInputBorderClass(showError),
            )}>
            <TextInput
              className={cn(
                'flex-1 px-3 py-3 text-foreground',
                compact ? 'text-center font-semibold' : '',
              )}
              style={{ minHeight: 48 }}
              value={value}
              onChangeText={handleChange}
              onBlur={() => setTouched(true)}
              placeholder={placeholder}
              placeholderTextColor={ROUTINE_FORM_INPUT.placeholderColor}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={maxDigits}
              {...getFormFieldInputA11y({
                label,
                error: showError ? validation.error : null,
                errorNativeId: errorId,
                hint: resolvedHint,
              })}
            />
            {suffix ? (
              <View
                style={{ width: SUFFIX_SLOT_WIDTH }}
                className="items-center justify-center border-l border-border/50 px-1">
                <Text className="text-[11px] font-bold text-muted" numberOfLines={1}>
                  {suffix}
                </Text>
              </View>
            ) : null}
          </View>

          {showClear ? (
            <Pressable
              onPress={handleClear}
              disabled={!canClear}
              accessibilityRole="button"
              accessibilityLabel={ROUTINE_UI.fieldClear}
              accessibilityState={{ disabled: !canClear }}
              style={{ width: CLEAR_BUTTON_SIZE, height: CLEAR_BUTTON_SIZE }}
              className={cn(
                'items-center justify-center rounded-xl border border-border bg-surface',
                !canClear && 'opacity-0',
              )}>
              <Text className=" font-bold text-muted">✕</Text>
            </Pressable>
          ) : null}
        </View>
      </Animated.View>

      <View className={cn(compact ? 'mt-1 min-h-[16px]' : 'mt-1.5 min-h-[18px]')}>
        {showError ? (
          <Text
            nativeID={errorId}
            className="text-[10px] leading-3 text-danger"
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            numberOfLines={2}>
            {validation.error}
          </Text>
        ) : showSuccess && validation.normalized ? (
          <Text className="text-xs text-success">
            {suffix ? `${validation.normalized} ${suffix}` : validation.normalized}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
