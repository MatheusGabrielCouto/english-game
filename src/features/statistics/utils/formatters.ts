export const formatNumber = (value: number): string =>
  value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

export const formatPercentage = (completed: number, total: number): number => {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
};

export const formatStudyTime = (minutes: number): string => {
  if (minutes <= 0) return '0 min';

  if (minutes < 60) {
    return `${formatNumber(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${formatNumber(hours)} horas`;
  }

  return `${formatNumber(hours)}h ${remainingMinutes}min`;
};

export const resolveStudyMinutes = (
  trackedMinutes: number,
  totalStudyDays: number,
  estimatedMinutesPerDay: number,
): number => Math.max(trackedMinutes, totalStudyDays * estimatedMinutesPerDay);
