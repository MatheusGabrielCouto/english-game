import { getApplicationHydratedAt, isApplicationStoresHydrated } from './application-hydration'

export const STARTUP_FOCUS_GRACE_MS = 60_000

export const isWithinStartupFocusGrace = (): boolean => {
  if (!isApplicationStoresHydrated()) return false
  const hydratedAt = getApplicationHydratedAt()
  if (hydratedAt == null) return false
  return Date.now() - hydratedAt < STARTUP_FOCUS_GRACE_MS
}

type SkipHydratedReadOptions = {
  /** Skip focus re-reads during the post-splash grace window only. */
  withinFocusGrace?: boolean
}

/**
 * Returns true when SQLite was already loaded at splash and the store has data —
 * mount/focus hooks can skip redundant reads.
 */
export const shouldSkipHydratedStoreReread = (
  storeReady: boolean,
  options?: SkipHydratedReadOptions,
): boolean => {
  if (!storeReady || !isApplicationStoresHydrated()) return false
  if (options?.withinFocusGrace) {
    return isWithinStartupFocusGrace()
  }
  return true
}

export const runFocusRefreshIfNeeded = (
  storeReady: boolean,
  refresh: () => void | Promise<void>,
): void => {
  if (shouldSkipHydratedStoreReread(storeReady, { withinFocusGrace: true })) return
  void refresh()
}
