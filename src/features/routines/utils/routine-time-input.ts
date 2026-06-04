/** Máscara de horário 24h: até 4 dígitos → HH:MM */

export const REMINDER_TIME_MAX_LENGTH = 5;

export const maskReminderTimeInput = (raw: string): string => {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

export type ReminderTimeValidation = {
  valid: boolean;
  normalized: string | null;
  error: string | null;
  incomplete: boolean;
};

export const validateReminderTime = (value: string): ReminderTimeValidation => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: true, normalized: null, error: null, incomplete: false };
  }

  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 4) {
    return {
      valid: false,
      normalized: null,
      error: 'Informe o horário completo (HH:MM)',
      incomplete: true,
    };
  }

  const masked = maskReminderTimeInput(trimmed);
  const match = /^(\d{2}):(\d{2})$/.exec(masked);
  if (!match) {
    return {
      valid: false,
      normalized: null,
      error: 'Use o formato HH:MM (ex.: 19:00)',
      incomplete: false,
    };
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23) {
    return {
      valid: false,
      normalized: null,
      error: 'Hora inválida (00–23)',
      incomplete: false,
    };
  }

  if (minutes > 59) {
    return {
      valid: false,
      normalized: null,
      error: 'Minutos inválidos (00–59)',
      incomplete: false,
    };
  }

  const normalized = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  return { valid: true, normalized, error: null, incomplete: false };
};

/** Normaliza valor salvo no banco para exibição no input. */
export const formatReminderTimeForInput = (stored: string | null | undefined): string => {
  if (!stored?.trim()) return '';
  const result = validateReminderTime(stored);
  return result.normalized ?? maskReminderTimeInput(stored);
};

const DEFAULT_PICKER_HOURS = 9;
const DEFAULT_PICKER_MINUTES = 0;

/** Converte HH:MM (ou vazio) para Date usado no DateTimePicker nativo. */
export const reminderTimeToDate = (value: string, fallback = new Date()): Date => {
  const result = validateReminderTime(value);
  const normalized = result.normalized;
  const base = new Date(fallback);
  base.setSeconds(0, 0);

  if (!normalized) {
    base.setHours(DEFAULT_PICKER_HOURS, DEFAULT_PICKER_MINUTES, 0, 0);
    return base;
  }

  const [hours, minutes] = normalized.split(':').map(Number);
  base.setHours(hours, minutes, 0, 0);
  return base;
};

/** Converte Date do picker nativo para HH:MM. */
export const dateToReminderTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
