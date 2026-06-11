import { useStartupHydrationStore } from './startup-hydration-store'

let criticalStoresHydrated = false
let applicationStoresHydrated = false
let hydratedAt: number | null = null

/** True after player, missions, routines — enough to dismiss splash and render tabs. */
export const isCriticalStoresHydrated = (): boolean => criticalStoresHydrated

/** True after startup SQLite → zustand/service cache hydration completes. */
export const isApplicationStoresHydrated = (): boolean => applicationStoresHydrated

export const getApplicationHydratedAt = (): number | null => hydratedAt

export const markCriticalStoresHydrated = (): void => {
  criticalStoresHydrated = true
  useStartupHydrationStore.getState().setCriticalReady()
}

export const markApplicationStoresHydrated = (): void => {
  applicationStoresHydrated = true
  hydratedAt = Date.now()
  useStartupHydrationStore.getState().setBackgroundReady()
}

/** Test helper — resets the in-memory hydration gate. */
export const resetApplicationHydrationForTests = (): void => {
  criticalStoresHydrated = false
  applicationStoresHydrated = false
  hydratedAt = null
  useStartupHydrationStore.getState().reset()
}
