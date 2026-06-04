import { useMemo, useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { cn } from '@/utils';

import { ROUTINE_FORM_INPUT } from '../constants/routine-form-limits';
import type { FieldValidation } from '../utils/routine-form-input';
import { RoutineFieldShell, routineInputBorderClass } from './RoutineFieldShell';

const INPUT_BASE =
  'w-full rounded-xl border bg-surface px-4 py-3 text-base text-foreground';

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

  const handleChange = (raw: string) => {
    const next = maxLength != null && raw.length > maxLength ? raw.slice(0, maxLength) : raw;
    onChange(next);
  };

  return (
    <RoutineFieldShell
      label={label}
      hint={hint}
      error={showError ? validation.error : null}
      footer={!showError ? charCount : null}
      footerTone="muted">
      <TextInput
        className={cn(INPUT_BASE, routineInputBorderClass(showError))}
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
        accessibilityLabel={accessibilityLabel ?? label}
      />
    </RoutineFieldShell>
  );
};
