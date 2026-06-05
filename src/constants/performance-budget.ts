/**
 * Performance budgets de produto (P-34).
 * Código puro — sem imports nativos — para testes Node.
 */
export const HOME_TTI_BUDGET_MS = 1500

export const CRITICAL_HYDRATION_WARN_MS = 1200

export const BACKGROUND_HYDRATION_WARN_MS = 8000

/** Splash pós-isReady — a cadeia deve caber em HOME_TTI_BUDGET_MS. */
export const SPLASH_PERF_BUDGET = {
  minVisibleMs: 520,
  exitDurationMs: 480,
  contentEnterDelayMs: 60,
  contentEnterDurationMs: 440,
  nativeHideDelayMs: 16,
} as const

export type StartupMilestone =
  | 'app_boot'
  | 'hydration_start'
  | 'hydration_critical_done'
  | 'hydration_ready'
  | 'splash_overlay_dismissed'
  | 'home_interactive'

export const STARTUP_MILESTONE_ORDER: StartupMilestone[] = [
  'app_boot',
  'hydration_start',
  'hydration_critical_done',
  'hydration_ready',
  'splash_overlay_dismissed',
  'home_interactive',
]

export const getSplashChainMs = (
  timing: Pick<
    typeof SPLASH_PERF_BUDGET,
    'minVisibleMs' | 'exitDurationMs' | 'contentEnterDelayMs' | 'contentEnterDurationMs'
  > = SPLASH_PERF_BUDGET,
): number => {
  const contentEnterMs = timing.contentEnterDelayMs + timing.contentEnterDurationMs
  return timing.minVisibleMs + Math.max(timing.exitDurationMs, contentEnterMs)
}

export const isWithinHomeTtiBudget = (ttiMs: number): boolean => ttiMs <= HOME_TTI_BUDGET_MS
