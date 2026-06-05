import type { TextInputProps } from 'react-native'

type FormFieldInputA11yParams = {
  label: string
  error?: string | null
  errorNativeId?: string
  hint?: string
}

export const getFormFieldInputA11y = ({
  label,
  error,
  errorNativeId,
  hint,
}: FormFieldInputA11yParams): Pick<
  TextInputProps,
  'accessibilityLabel' | 'accessibilityHint' | 'accessibilityDescribedBy'
> => ({
  accessibilityLabel: label,
  accessibilityHint: hint,
  ...(error && errorNativeId ? { accessibilityDescribedBy: errorNativeId } : {}),
})

export const resolveFormFieldErrorId = (fieldId: string) => `${fieldId}-error`
