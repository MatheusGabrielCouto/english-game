/** Shared modal motion + dismiss tuning — English Quest. @see docs/DESIGN_SYSTEM.md */
export const MODAL_SPRING = {
  damping: 18,
  stiffness: 240,
  mass: 0.9,
} as const

export const MODAL_SHEET_SPRING = {
  damping: 22,
  stiffness: 260,
  mass: 0.95,
} as const

export const MODAL_BACKDROP = {
  tint: 'dark' as const,
  intensity: 48,
  androidOpacity: 0.72,
} as const

export const MODAL_SHEET_DISMISS = {
  distanceThreshold: 120,
  velocityThreshold: 900,
} as const

export type ModalPresentation = 'center' | 'sheet'
