export const SKELETON_STAGGER = {
  blockStepMs: 55,
  listItemStepMs: 80,
  enterDurationMs: 300,
  enterOffsetY: 10,
  enterSpring: { damping: 18, stiffness: 220 },
} as const

export const getSkeletonStaggerDelay = (
  index: number,
  stepMs: number = SKELETON_STAGGER.listItemStepMs,
): number => Math.max(0, index) * stepMs
