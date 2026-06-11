import { useStartupHydrationStore } from './startup-hydration-store'

/** Hydration caps at 97% — fonts add the final 3% in AppProviders. */
export const HYDRATION_PROGRESS_CAP = 97

export const FONTS_PROGRESS_DELTA = 3

export const resetHydrationProgress = (): void => {
  useStartupHydrationStore.getState().resetProgress()
}

export const advanceHydrationProgress = (delta: number): void => {
  const { progress, setProgress } = useStartupHydrationStore.getState()
  setProgress(Math.min(HYDRATION_PROGRESS_CAP, progress + delta))
}

export const finishHydrationProgress = (): void => {
  const { progress, setProgress } = useStartupHydrationStore.getState()
  setProgress(Math.max(progress, HYDRATION_PROGRESS_CAP))
}

export const finishStartupProgress = (): void => {
  useStartupHydrationStore.getState().setProgress(100)
}
