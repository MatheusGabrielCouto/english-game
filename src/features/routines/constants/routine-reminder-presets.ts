export type RoutineReminderPreset = {
  label: string;
  time: string;
};

export const ROUTINE_REMINDER_PRESETS: RoutineReminderPreset[] = [
  { label: '6:00', time: '06:00' },
  { label: '7:00', time: '07:00' },
  { label: '12:00', time: '12:00' },
  { label: '19:00', time: '19:00' },
  { label: '21:00', time: '21:00' },
];
