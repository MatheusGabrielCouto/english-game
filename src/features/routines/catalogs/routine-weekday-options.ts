import { ROUTINE_WEEKDAY_LABELS } from './routine-templates';

/** Ordem Seg → Dom (valores 0=dom … 6=sáb, Date.getUTCDay). */
export const ROUTINE_WEEKDAY_OPTIONS = [
  { value: 1, label: ROUTINE_WEEKDAY_LABELS[1] },
  { value: 2, label: ROUTINE_WEEKDAY_LABELS[2] },
  { value: 3, label: ROUTINE_WEEKDAY_LABELS[3] },
  { value: 4, label: ROUTINE_WEEKDAY_LABELS[4] },
  { value: 5, label: ROUTINE_WEEKDAY_LABELS[5] },
  { value: 6, label: ROUTINE_WEEKDAY_LABELS[6] },
  { value: 0, label: ROUTINE_WEEKDAY_LABELS[0] },
] as const;
