import { useMemo, useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { getFormFieldInputA11y, resolveFormFieldErrorId } from '@/components/ui/form/form-field-a11y';
import { formInputBorderClass } from '@/constants/form-validation-ui';
import { cn } from '@/utils';

import { ROUTINE_FORM_INPUT } from '../constants/routine-form-limits';
import type { FieldValidation } from '../utils/routine-form-input';
import { RoutineFieldShell } from './RoutineFieldShell';

const INPUT_BASE =
  'w-full rounded-xl border bg-surface px-4 py-3  text-foreground';

type RoutineFormTextFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  validate: (value: string) => FieldValidation;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  forceShowError?: boolean;
  accessibilityLabel?: string;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  showCharCount?: boolean;
};

export const RoutineFormTextField = ({
  label,
  hint,
  value,
  onChange,
  validate,
  placeholder,
  maxLength,
  multiline = false,
  forceShowError = false,
  accessibilityLabel,
  autoCapitalize = 'sentences',
  showCharCount = false,
}: RoutineFormTextFieldProps) => {
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => validate(value), [validate, value]);

  const showError =
    (forceShowError || touched) && !validation.valid && validation.error != null;

  const charCount =
    showCharCount && maxLength != null ? `${value.length}/${maxLength}` : null;
  const fieldId = label.toLowerCase().replace(/\s+/g, '-');
  const errorId = resolveFormFieldErrorId(fieldId);

  const handleChange = (raw: string) => {
    const next = maxLength != null && raw.length > maxLength ? raw.slice(0, maxLength) : raw;
    onChange(next);
  };

  return (
    <RoutineFieldShell
      label={label}
      hint={hint}
      fieldId={fieldId}
      error={showError ? validation.error : null}
      footer={!showError ? charCount : null}
      footerTone="muted">
      <TextInput
        className={cn(INPUT_BASE, formInputBorderClass(showError))}
        style={multiline ? { minHeight: 96, textAlignVertical: 'top' } : { minHeight: 48 }}
        value={value}
        onChangeText={handleChange}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        placeholderTextColor={ROUTINE_FORM_INPUT.placeholderColor}
        maxLength={maxLength}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        autoCorrect={multiline}
        {...getFormFieldInputA11y({
          label: accessibilityLabel ?? label,
          error: showError ? validation.error : null,
          errorNativeId: errorId,
          hint,
        })}
      />
    </RoutineFieldShell>
  );
};
