export const formatIdleTimeRemaining = (endsAt: string, nowMs: number, readyLabel: string): string => {
  const diff = new Date(endsAt).getTime() - nowMs;
  if (diff <= 0) return readyLabel;
  const mins = Math.ceil(diff / 60_000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h >= 24) {
    const d = Math.floor(h / 24);
    const rh = h % 24;
    return rh > 0 ? `${d}d ${rh}h` : `${d}d`;
  }
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

export const idleSessionProgressPct = (startedAt: string, endsAt: string, nowMs: number): number => {
  const start = new Date(startedAt).getTime();
  const end = new Date(endsAt).getTime();
  const total = end - start;
  if (total <= 0) return 100;
  const elapsed = nowMs - start;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};
