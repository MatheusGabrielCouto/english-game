import { useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';

import { cn } from '@/utils';

import { ROUTINE_FORM_INPUT } from '../constants/routine-form-limits';
import type { FieldValidation } from '../utils/routine-form-input';
import { maskDigitsInput } from '../utils/routine-form-input';
import { RoutineFieldShell, routineInputBorderClass } from './RoutineFieldShell';

const INPUT_BASE =
  'w-full rounded-xl border bg-surface px-4 py-3 text-base text-foreground';

type RoutineFormNumberFieldProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  validate: (value: string) => FieldValidation;
  placeholder?: string;
  maxDigits?: number;
  suffix?: string;
  optionalDefaultHint?: string;
  forceShowError?: boolean;
};

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
}: RoutineFormNumberFieldProps) => {
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => validate(value), [validate, value]);

  const showError =
    (forceShowError || touched) && !validation.valid && validation.error != null;

  const showSuccess =
    touched && validation.valid && validation.normalized != null;

  const handleChange = (raw: string) => {
    onChange(maskDigitsInput(raw, maxDigits));
  };

  const handleClear = () => {
    setTouched(false);
    onChange('');
  };

  const resolvedHint = hint ?? (value.length === 0 ? optionalDefaultHint : undefined);

  return (
    <RoutineFieldShell
      label={label}
      hint={resolvedHint}
      error={showError ? validation.error : null}
      footer={
        showSuccess && validation.normalized
          ? suffix
            ? `${validation.normalized} ${suffix}`
            : validation.normalized
          : null
      }
      footerTone="success"
      showClear={value.length > 0}
      onClear={handleClear}>
      <View className="relative w-full justify-center">
        <TextInput
          className={cn(INPUT_BASE, routineInputBorderClass(showError), suffix ? 'pr-14' : '')}
          style={{ minHeight: 48 }}
          value={value}
          onChangeText={handleChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          placeholderTextColor={ROUTINE_FORM_INPUT.placeholderColor}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={maxDigits}
          accessibilityLabel={label}
        />
        {suffix ? (
          <View className="pointer-events-none absolute right-4">
            <Text className="text-sm font-semibold text-muted">{suffix}</Text>
          </View>
        ) : null}
      </View>
    </RoutineFieldShell>
  );
};
