export const MENTOR_RETENTION_DAYS_DEFAULT = 90

export const MENTOR_RETENTION_DAY_OPTIONS = [30, 90, 180, 365] as const

export type MentorRetentionDaysOption = (typeof MENTOR_RETENTION_DAY_OPTIONS)[number]

export const MENTOR_RETENTION_PRUNE_INTERVAL_MS = 24 * 60 * 60 * 1000

export const MentorRetentionMemoryKey = {
  ENABLED: 'settings_retention_enabled',
  DAYS: 'settings_retention_days',
  LAST_PRUNE_AT: 'settings_last_prune_at',
} as const
