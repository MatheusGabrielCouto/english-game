import { MIN_TOUCH_TARGET_PT } from '@/constants/touch-target-ui'

export type TouchTargetHitSlop = {
  top: number
  bottom: number
  left: number
  right: number
}

/** Expands a pressable's hit area to at least `minPt` per axis. */
export const resolveHitSlopForSize = (
  width: number,
  height: number,
  minPt = MIN_TOUCH_TARGET_PT,
): TouchTargetHitSlop => {
  const padW = Math.max(0, (minPt - width) / 2)
  const padH = Math.max(0, (minPt - height) / 2)
  return {
    top: padH,
    bottom: padH,
    left: padW,
    right: padW,
  }
}
