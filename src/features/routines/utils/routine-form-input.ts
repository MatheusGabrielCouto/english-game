import type { RoutineFrequencyValue } from '@/types/routine';
import { ROUTINE_FORM_LIMITS } from '../constants/routine-form-limits';
import { validateReminderTime } from './routine-time-input';
import { validateRoutineWeekdays } from './routine-weekdays';

export type FieldValidation = {
  valid: boolean;
  error: string | null;
  normalized: string | null;
};

export const maskDigitsInput = (raw: string, maxDigits: number): string =>
  raw.replace(/\D/g, '').slice(0, maxDigits);

export const validateRoutineName = (value: string): FieldValidation => {
  const trimmed = value.trim();
  if (trimmed.length < ROUTINE_FORM_LIMITS.nameMin) {
    return {
      valid: false,
      error: `Nome precisa ter pelo menos ${ROUTINE_FORM_LIMITS.nameMin} caracteres`,
      normalized: null,
    };
  }
  if (trimmed.length > ROUTINE_FORM_LIMITS.nameMax) {
    return {
      valid: false,
      error: `Nome pode ter no máximo ${ROUTINE_FORM_LIMITS.nameMax} caracteres`,
      normalized: null,
    };
  }
  return { valid: true, error: null, normalized: trimmed };
};

export const validateRoutineDescription = (value: string): FieldValidation => {
  const trimmed = value.trim();
  if (trimmed.length > ROUTINE_FORM_LIMITS.descriptionMax) {
    return {
      valid: false,
      error: `Descrição pode ter no máximo ${ROUTINE_FORM_LIMITS.descriptionMax} caracteres`,
      normalized: null,
    };
  }
  return { valid: true, error: null, normalized: trimmed.length > 0 ? trimmed : null };
};

export const validateOptionalDuration = (value: string): FieldValidation & { normalizedNumber: number | null } => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: true, error: null, normalized: null, normalizedNumber: null };
  }

  const amount = Number(trimmed);
  if (!Number.isInteger(amount) || amount < ROUTINE_FORM_LIMITS.durationMin) {
    return {
      valid: false,
      error: `Mínimo ${ROUTINE_FORM_LIMITS.durationMin} minutos`,
      normalized: null,
      normalizedNumber: null,
    };
  }
  if (amount > ROUTINE_FORM_LIMITS.durationMax) {
    return {
      valid: false,
      error: `Máximo ${ROUTINE_FORM_LIMITS.durationMax} minutos`,
      normalized: null,
      normalizedNumber: null,
    };
  }

  return { valid: true, error: null, normalized: String(amount), normalizedNumber: amount };
};

export const validateOptionalReward = (
  value: string,
  kind: 'xp' | 'coins',
): FieldValidation & { normalizedNumber: number | null } => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: true, error: null, normalized: null, normalizedNumber: null };
  }

  const limits =
    kind === 'xp'
      ? { min: ROUTINE_FORM_LIMITS.customXpMin, max: ROUTINE_FORM_LIMITS.customXpMax, label: 'XP' }
      : {
          min: ROUTINE_FORM_LIMITS.customCoinsMin,
          max: ROUTINE_FORM_LIMITS.customCoinsMax,
          label: 'Moedas',
        };

  const amount = Number(trimmed);
  if (!Number.isInteger(amount) || amount < limits.min) {
    return {
      valid: false,
      error: `${limits.label}: mínimo ${limits.min}`,
      normalized: null,
      normalizedNumber: null,
    };
  }
  if (amount > limits.max) {
    return {
      valid: false,
      error: `${limits.label}: máximo ${limits.max}`,
      normalized: null,
      normalizedNumber: null,
    };
  }

  return { valid: true, error: null, normalized: String(amount), normalizedNumber: amount };
};

export const validateCustomRewardsPair = (
  customXp: string,
  customCoins: string,
): { valid: boolean; error: string | null } => {
  const hasXp = customXp.trim().length > 0;
  const hasCoins = customCoins.trim().length > 0;
  if (hasXp === hasCoins) {
    return { valid: true, error: null };
  }
  return {
    valid: false,
    error: 'Informe XP e moedas juntas, ou deixe os dois vazios para usar o padrão.',
  };
};

export type RoutineFormValidation = {
  valid: boolean;
  name: FieldValidation;
  description: FieldValidation;
  reminderTime: ReturnType<typeof validateReminderTime>;
  weekdays: ReturnType<typeof validateRoutineWeekdays>;
  duration: ReturnType<typeof validateOptionalDuration>;
  customXp: ReturnType<typeof validateOptionalReward>;
  customCoins: ReturnType<typeof validateOptionalReward>;
  rewardsPair: ReturnType<typeof validateCustomRewardsPair>;
};

export const validateRoutineForm = (
  values: {
    name: string;
    description: string;
    reminderTime: string;
    frequency: RoutineFrequencyValue;
    weekdays: number[];
    expectedDurationMin: string;
    customXp: string;
    customCoins: string;
  },
): RoutineFormValidation => {
  const name = validateRoutineName(values.name);
  const description = validateRoutineDescription(values.description);
  const reminderTime = validateReminderTime(values.reminderTime);
  const weekdays = validateRoutineWeekdays(values.frequency, values.weekdays);
  const duration = validateOptionalDuration(values.expectedDurationMin);
  const customXp = validateOptionalReward(values.customXp, 'xp');
  const customCoins = validateOptionalReward(values.customCoins, 'coins');
  const rewardsPair = validateCustomRewardsPair(values.customXp, values.customCoins);

  const valid =
    name.valid &&
    description.valid &&
    reminderTime.valid &&
    weekdays.valid &&
    duration.valid &&
    customXp.valid &&
    customCoins.valid &&
    rewardsPair.valid;

  return {
    valid,
    name,
    description,
    reminderTime,
    weekdays,
    duration,
    customXp,
    customCoins,
    rewardsPair,
  };
};
