import {
  BACKGROUND_HYDRATION_WARN_MS,
  CRITICAL_HYDRATION_WARN_MS,
  HOME_TTI_BUDGET_MS,
  type StartupMilestone,
  isWithinHomeTtiBudget,
} from '@/constants/performance-budget'
import { AppLogService } from '@/services/app-log-service'

type StartupPerfSnapshot = {
  milestones: Partial<Record<StartupMilestone, number>>
  criticalHydrationMs: number | null
  backgroundHydrationMs: number | null
  homeTtiMs: number | null
  withinBudget: boolean | null
}

const marks = new Map<StartupMilestone, number>()
let bootAt = Date.now()
let criticalHydrationMs: number | null = null
let backgroundHydrationMs: number | null = null
let homeTtiReported = false

const getMark = (milestone: StartupMilestone): number | undefined => marks.get(milestone)

const resolveHomeInteractiveAt = (): number | null => {
  const splashDismissed = getMark('splash_overlay_dismissed')
  if (splashDismissed === undefined) return null

  const homeInteractive = getMark('home_interactive')
  return homeInteractive !== undefined
    ? Math.max(splashDismissed, homeInteractive)
    : splashDismissed
}

const resolveHomeTtiMs = (): number | null => {
  const hydrationReady = getMark('hydration_ready')
  const interactiveAt = resolveHomeInteractiveAt()
  if (hydrationReady === undefined || interactiveAt === null) return null
  return interactiveAt - hydrationReady
}

const buildSnapshot = (): StartupPerfSnapshot => {
  const homeTtiMs = resolveHomeTtiMs()

  return {
    milestones: Object.fromEntries(marks.entries()),
    criticalHydrationMs,
    backgroundHydrationMs,
    homeTtiMs,
    withinBudget: homeTtiMs === null ? null : isWithinHomeTtiBudget(homeTtiMs),
  }
}

const maybeReportHomeTti = (): void => {
  if (homeTtiReported) return

  const hydrationReady = getMark('hydration_ready')
  const interactiveAt = resolveHomeInteractiveAt()
  if (hydrationReady === undefined || interactiveAt === null) return

  homeTtiReported = true
  const ttiMs = interactiveAt - hydrationReady
  const snapshot = buildSnapshot()
  const metadata = {
    ttiMs,
    budgetMs: HOME_TTI_BUDGET_MS,
    criticalHydrationMs,
    splashDismissedMs: getMark('splash_overlay_dismissed')! - hydrationReady,
    homeContentReadyMs:
      getMark('home_interactive') !== undefined
        ? getMark('home_interactive')! - hydrationReady
        : null,
    bootToInteractiveMs: interactiveAt - bootAt,
    milestones: snapshot.milestones,
  }

  if (isWithinHomeTtiBudget(ttiMs)) {
    AppLogService.info('perf.home_tti', 'Home interactive within budget', metadata)
    return
  }

  AppLogService.warn(
    'perf.home_tti_budget_exceeded',
    'Home TTI exceeded post-hydration budget',
    metadata,
  )
}

export const StartupPerfService = {
  markBoot(): void {
    bootAt = Date.now()
    marks.clear()
    criticalHydrationMs = null
    backgroundHydrationMs = null
    homeTtiReported = false
    marks.set('app_boot', bootAt)
  },

  mark(milestone: StartupMilestone, at: number = Date.now()): void {
    if (marks.has(milestone)) return
    marks.set(milestone, at)

    if (milestone === 'splash_overlay_dismissed' || milestone === 'home_interactive') {
      maybeReportHomeTti()
    }
  },

  recordCriticalHydrationMs(durationMs: number): void {
    criticalHydrationMs = durationMs

    if (durationMs > CRITICAL_HYDRATION_WARN_MS) {
      AppLogService.warn('perf.hydration_critical_slow', 'Critical hydration exceeded warn threshold', {
        durationMs,
        warnMs: CRITICAL_HYDRATION_WARN_MS,
      })
    }
  },

  recordBackgroundHydrationMs(durationMs: number): void {
    backgroundHydrationMs = durationMs

    if (durationMs > BACKGROUND_HYDRATION_WARN_MS) {
      AppLogService.warn('perf.hydration_background_slow', 'Background hydration exceeded warn threshold', {
        durationMs,
        warnMs: BACKGROUND_HYDRATION_WARN_MS,
      })
    }
  },

  getSnapshot(): StartupPerfSnapshot {
    return buildSnapshot()
  },
}
