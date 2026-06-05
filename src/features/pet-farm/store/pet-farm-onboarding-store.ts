import { create } from 'zustand'

import type { PetFarmOnboardingTargetKey } from '../constants/pet-farm-onboarding-ui'

export type PetFarmOnboardingTargetRect = {
  x: number
  y: number
  width: number
  height: number
}

type PetFarmOnboardingStore = {
  isActive: boolean
  stepIndex: number
  targets: Partial<Record<PetFarmOnboardingTargetKey, PetFarmOnboardingTargetRect>>
  remeasureTick: number
  registerTarget: (key: PetFarmOnboardingTargetKey, rect: PetFarmOnboardingTargetRect) => void
  requestRemeasure: () => void
  start: () => void
  next: () => void
  skip: () => void
  finish: () => void
}

export const usePetFarmOnboardingStore = create<PetFarmOnboardingStore>()((set) => ({
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
