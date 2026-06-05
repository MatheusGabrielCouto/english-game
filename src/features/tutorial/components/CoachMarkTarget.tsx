import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { View, type ViewProps } from 'react-native'

import type { CoachMarkTargetKey } from '../constants/coach-mark-steps'
import { useCoachMarkStore } from '../store/coach-mark-store'

type CoachMarkTargetProps = ViewProps & {
  coachKey: CoachMarkTargetKey
  children: ReactNode
}

export const CoachMarkTarget = ({ coachKey, children, className, ...props }: CoachMarkTargetProps) => {
  const ref = useRef<View>(null)
  const registerTarget = useCoachMarkStore((s) => s.registerTarget)
  const remeasureTick = useCoachMarkStore((s) => s.remeasureTick)
  const isActive = useCoachMarkStore((s) => s.isActive)

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return
      registerTarget(coachKey, { x, y, width, height })
    })
  }, [coachKey, registerTarget])

  useEffect(() => {
    if (!isActive) return
    const timer = setTimeout(measure, 80)
    return () => clearTimeout(timer)
  }, [isActive, measure, remeasureTick])

  return (
    <View
      ref={ref}
      collapsable={false}
      onLayout={measure}
      className={className}
      {...props}>
      {children}
    </View>
  )
}
