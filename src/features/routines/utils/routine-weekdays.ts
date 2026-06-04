import { RoutineFrequency, type RoutineFrequencyValue } from '@/types/routine';

export const frequencyShowsWeekdayPicker = (frequency: RoutineFrequencyValue): boolean =>
  frequency === RoutineFrequency.CUSTOM ||
  frequency === RoutineFrequency.WEEKLY ||
  frequency === RoutineFrequency.MONTHLY;

export const frequencyRequiresWeekdays = (frequency: RoutineFrequencyValue): boolean =>
  frequency === RoutineFrequency.CUSTOM || frequency === RoutineFrequency.WEEKLY;

export const validateRoutineWeekdays = (
  frequency: RoutineFrequencyValue,
  weekdays: number[],
): { valid: boolean; error: string | null } => {
  if (!frequencyRequiresWeekdays(frequency)) {
    return { valid: true, error: null };
  }
  if (weekdays.length === 0) {
    return { valid: false, error: 'Selecione pelo menos um dia da semana' };
  }
  return { valid: true, error: null };
};
