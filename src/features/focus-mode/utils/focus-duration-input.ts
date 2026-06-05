import {
    FOCUS_DURATION_MAX_MINUTES,
    FOCUS_DURATION_MIN_MINUTES,
} from '../constants/focus-config';

export const clampFocusDurationMinutes = (minutes: number): number =>
  Math.min(
    FOCUS_DURATION_MAX_MINUTES,
    Math.max(FOCUS_DURATION_MIN_MINUTES, Math.round(minutes)),
  );

export const parseFocusDurationInput = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed)) return null;
  return clampFocusDurationMinutes(parsed);
};

export const maskFocusDurationInput = (raw: string): string => raw.replace(/\D/g, '').slice(0, 3);
