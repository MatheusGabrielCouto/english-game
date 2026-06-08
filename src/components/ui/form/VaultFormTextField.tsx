import { useMemo, useState } from 'react'
import { TextInput, type TextInputProps } from 'react-native'

import { theme } from '@/constants'
import { formInputBorderClass } from '@/constants/form-validation-ui'
import { cn } from '@/utils'

import { getFormFieldInputA11y, resolveFormFieldErrorId } from './form-field-a11y'
import { FormFieldShell } from './FormFieldShell'

export type VaultFieldValidation = { valid: boolean; error: string | null }

type VaultFormTextFieldProps = {
  label: string
  hint?: string
  value: string
  onChangeText: (value: string) => void
  validate?: (value: string) => VaultFieldValidation
  forceShowError?: boolean
  fieldId?: string
  placeholder?: string
  maxLength?: number
  multiline?: boolean
  editable?: boolean
  accessibilityLabel?: string
  autoCapitalize?: TextInputProps['autoCapitalize']
}

export const VaultFormTextField = ({
  label,
  hint,
  value,
  onChangeText,
  validate,
  forceShowError = false,
  fieldId,
  placeholder,
  maxLength,
  multiline = false,
  editable = true,
  accessibilityLabel,
  autoCapitalize = 'sentences',
}: VaultFormTextFieldProps) => {
  const [touched, setTouched] = useState(false)
  const validation = useMemo(
    () => validate?.(value) ?? { valid: true, error: null },
    [validate, value],
  )
  const showError =
    (forceShowError || touched) && !validation.valid && validation.error != null
  const resolvedFieldId = fieldId ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId = resolveFormFieldErrorId(resolvedFieldId)

  return (
    <FormFieldShell
      label={label}
      hint={hint}
      error={showError ? validation.error : null}
      fieldId={resolvedFieldId}>
      <TextInput
        className={cn(
          'rounded-xl border bg-surface px-4 py-3  text-foreground',
          formInputBorderClass(showError),
          multiline && 'min-h-[88px]',
        )}
        style={multiline ? { textAlignVertical: 'top' } : undefined}
        value={value}
        onChangeText={onChangeText}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        maxLength={maxLength}
        multiline={multiline}
        editable={editable}
        autoCapitalize={autoCapitalize}
        {...getFormFieldInputA11y({
          label: accessibilityLabel ?? label,
          error: showError ? validation.error : null,
          errorNativeId: errorId,
          hint,
        })}
      />
    </FormFieldShell>
  )
}
