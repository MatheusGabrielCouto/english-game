import { useMemo, useState } from 'react';
import { TextInput } from 'react-native';

import { cn } from '@/utils';

import { ROUTINE_FORM_INPUT } from '../constants/routine-form-limits';
import { ROUTINE_UI } from '../constants/routine-ui';
import {
    REMINDER_TIME_MAX_LENGTH,
    maskReminderTimeInput,
    validateReminderTime,
} from '../utils/routine-time-input';
import { RoutineFieldShell, routineInputBorderClass } from './RoutineFieldShell';

type RoutineReminderTimeFieldProps = {
  value: string;
  onChange: (value: string) => void;
  forceShowError?: boolean;
};

export const RoutineReminderTimeField = ({
  value,
  onChange,
  forceShowError = false,
}: RoutineReminderTimeFieldProps) => {
  const [touched, setTouched] = useState(false);

  const validation = useMemo(() => validateReminderTime(value), [value]);

  const digitsCount = value.replace(/\D/g, '').length;
  const showError =
    !validation.valid &&
    validation.error != null &&
    (forceShowError || touched || digitsCount >= 4);

  const handleChange = (raw: string) => {
    onChange(maskReminderTimeInput(raw));
  };

  const handleBlur = () => {
    setTouched(true);
    const next = validateReminderTime(value);
    if (next.valid && next.normalized && next.normalized !== value) {
      onChange(next.normalized);
    }
  };

  const handleClear = () => {
    setTouched(false);
    onChange('');
  };

  return (
    <RoutineFieldShell
      label={ROUTINE_UI.reminderTimeLabel}
      hint={ROUTINE_UI.reminderTimeHint}
      error={showError ? validation.error : null}
      footer={
        touched && validation.valid && validation.normalized
          ? ROUTINE_UI.reminderTimeConfirmed(validation.normalized)
          : null
      }
      footerTone="success"
      showClear={value.length > 0}
      onClear={handleClear}>
      <TextInput
        className={cn(
          'w-full rounded-xl border bg-surface px-4 py-3 text-center font-mono text-xl tracking-[0.2em] text-foreground',
          routineInputBorderClass(showError),
        )}
        style={{ minHeight: 48 }}
        value={value}
        onChangeText={handleChange}
        onBlur={handleBlur}
        placeholder={ROUTINE_UI.reminderTimePlaceholder}
        placeholderTextColor={ROUTINE_FORM_INPUT.placeholderColor}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={REMINDER_TIME_MAX_LENGTH}
        accessibilityLabel={ROUTINE_UI.reminderTimeAccessibility}
      />
    </RoutineFieldShell>
  );
};

export { formatReminderTimeForInput, validateReminderTime } from '../utils/routine-time-input';
