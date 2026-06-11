import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { Dimensions, findNodeHandle, View, type ViewProps } from 'react-native'

import { useHomeScrollContentRef } from '@/features/home/context/home-scroll-context'

import { COACH_MARK_STEPS } from '../constants/coach-mark-steps'
import type { CoachMarkTargetKey } from '../constants/coach-mark-steps'
import { useCoachMarkStore } from '../store/coach-mark-store'

type CoachMarkTargetProps = ViewProps & {
  coachKey: CoachMarkTargetKey
  children: ReactNode
}

const SAFE_TOP = 108
const SAFE_BOTTOM_INSET = 300

export const CoachMarkTarget = ({ coachKey, children, className, ...props }: CoachMarkTargetProps) => {
  const ref = useRef<View>(null)
  const contentRef = useHomeScrollContentRef()
  const registerTarget = useCoachMarkStore((s) => s.registerTarget)
  const requestHomeScroll = useCoachMarkStore((s) => s.requestHomeScroll)
  const remeasureTick = useCoachMarkStore((s) => s.remeasureTick)
  const isActive = useCoachMarkStore((s) => s.isActive)
  const stepIndex = useCoachMarkStore((s) => s.stepIndex)

  const activeCoachKey = isActive ? COACH_MARK_STEPS[stepIndex]?.targetKey : null

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return
      registerTarget(coachKey, { x, y, width, height })
    })
  }, [coachKey, registerTarget])

  const scrollIntoViewIfNeeded = useCallback(() => {
    if (!contentRef?.current || !ref.current) return

    const contentNode = findNodeHandle(contentRef.current)
    const targetNode = findNodeHandle(ref.current)
    if (!contentNode || !targetNode) return

    ref.current.measureLayout(
      contentNode,
      (_x, contentY) => {
        ref.current?.measureInWindow((_windowX, windowY, _width, height) => {
          const windowHeight = Dimensions.get('window').height
          const isVisible =
            windowY >= SAFE_TOP && windowY + height <= windowHeight - SAFE_BOTTOM_INSET

          if (!isVisible) {
            requestHomeScroll(Math.max(0, contentY - 32))
            return
          }

          measure()
        })
      },
      measure,
    )
  }, [contentRef, measure, requestHomeScroll])

  useEffect(() => {
    if (!isActive) return

    const timer = setTimeout(() => {
      if (coachKey === activeCoachKey) {
        scrollIntoViewIfNeeded()
        return
      }
      measure()
    }, 80)

    return () => clearTimeout(timer)
  }, [activeCoachKey, coachKey, isActive, measure, remeasureTick, scrollIntoViewIfNeeded])

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
