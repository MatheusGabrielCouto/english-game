import type { StatisticsRefreshTrigger } from '../constants/statistics-refresh-ui'

/**
 * Evita ~12 reads SQLite ao abrir Insights quando o hydrate já populou o store (P-42).
 */
export const shouldRefreshStatistics = (
  trigger: StatisticsRefreshTrigger,
  hasCachedDashboard: boolean,
  isHydrating: boolean,
): boolean => {
  if (trigger === 'mount') {
    return !hasCachedDashboard && !isHydrating
  }

  return true
}
