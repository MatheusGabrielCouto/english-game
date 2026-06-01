/** Returns a finite percentage in [0, 100] for progress bars. */
export const toProgressPercent = (value: number, max: number): number => {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0
  const ratio = Math.min(Math.max(value / max, 0), 1)
  return Math.round(ratio * 100)
}
