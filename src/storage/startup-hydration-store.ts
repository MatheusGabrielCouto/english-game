import { create } from 'zustand'

type StartupHydrationState = {
  criticalReady: boolean
  backgroundReady: boolean
  progress: number
  setProgress: (progress: number) => void
  setCriticalReady: () => void
  setBackgroundReady: () => void
  reset: () => void
  resetProgress: () => void
}

/** Reactive gate so Home re-renders when background hydration finishes. */
export const useStartupHydrationStore = create<StartupHydrationState>((set) => ({
  criticalReady: false,
  backgroundReady: false,
  progress: 0,
  setProgress: (progress) =>
    set({ progress: Math.min(100, Math.max(0, Math.round(progress))) }),
  setCriticalReady: () => set({ criticalReady: true }),
  setBackgroundReady: () => set({ backgroundReady: true }),
  reset: () => set({ criticalReady: false, backgroundReady: false, progress: 0 }),
  resetProgress: () => set({ progress: 0 }),
}))
