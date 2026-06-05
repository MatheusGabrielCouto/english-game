/**
 * Gatilhos de refresh do dashboard (P-42).
 * Código puro — sem imports nativos — para testes Node.
 */
export const STATISTICS_REFRESH_TRIGGERS = ['mount', 'details_expand', 'pull'] as const

export type StatisticsRefreshTrigger = (typeof STATISTICS_REFRESH_TRIGGERS)[number]
