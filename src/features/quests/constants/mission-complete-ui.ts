export const MISSION_COMPLETE_ANIM = {
  morphDelayMs: 0,
  morphDurationMs: 200,
  checkSpring: { damping: 12, stiffness: 280 },
  coinFloatDelaysMs: [0, 70, 140] as const,
  coinFloatDurationMs: 720,
  coinFloatDistance: -36,
} as const
