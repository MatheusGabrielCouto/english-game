export const buildRetentionCutoffIso = (retentionDays: number, now = new Date()): string => {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - retentionDays)
  return cutoff.toISOString()
}
