import { create } from 'zustand'

import type { CoachMarkTargetKey } from '../constants/coach-mark-steps'

export type CoachMarkTargetRect = {
  x: number
  y: number
  width: number
  height: number
}

type CoachMarkStore = {
  isActive: boolean
  stepIndex: number
  targets: Partial<Record<CoachMarkTargetKey, CoachMarkTargetRect>>
  remeasureTick: number
  registerTarget: (key: CoachMarkTargetKey, rect: CoachMarkTargetRect) => void
  requestRemeasure: () => void
  start: () => void
  next: () => void
  skip: () => void
  finish: () => void
}

export const useCoachMarkStore = create<CoachMarkStore>()((set) => ({
  isActive: false,
  stepIndex: 0,
  targets: {},
  remeasureTick: 0,

  registerTarget: (key, rect) =>
    set((state) => ({
      targets: {
        ...state.targets,
        [key]: rect,
      },
    })),

  requestRemeasure: () =>
    set((state) => ({
      remeasureTick: state.remeasureTick + 1,
    })),

  start: () =>
    set({
      isActive: true,
      stepIndex: 0,
      targets: {},
      remeasureTick: 0,
    }),

  next: () =>
    set((state) => ({
      stepIndex: state.stepIndex + 1,
    })),

  skip: () =>
    set({
      isActive: false,
      stepIndex: 0,
      targets: {},
    }),

  finish: () =>
    set({
      isActive: false,
      stepIndex: 0,
      targets: {},
    }),
}))
