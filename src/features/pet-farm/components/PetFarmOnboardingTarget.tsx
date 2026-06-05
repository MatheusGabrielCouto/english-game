import { type ReactNode, useCallback, useEffect, useRef } from 'react'
import { View, type ViewProps } from 'react-native'

import type { PetFarmOnboardingTargetKey } from '../constants/pet-farm-onboarding-ui'
import { usePetFarmOnboardingStore } from '../store/pet-farm-onboarding-store'

type PetFarmOnboardingTargetProps = ViewProps & {
  targetKey: PetFarmOnboardingTargetKey
  children: ReactNode
}

export const PetFarmOnboardingTarget = ({
  targetKey,
  children,
  className,
  ...props
}: PetFarmOnboardingTargetProps) => {
  const ref = useRef<View>(null)
  const registerTarget = usePetFarmOnboardingStore((s) => s.registerTarget)
  const remeasureTick = usePetFarmOnboardingStore((s) => s.remeasureTick)
  const isActive = usePetFarmOnboardingStore((s) => s.isActive)

  const measure = useCallback(() => {
    ref.current?.measureInWindow((x, y, width, height) => {
      if (width <= 0 || height <= 0) return
      registerTarget(targetKey, { x, y, width, height })
    })
  }, [registerTarget, targetKey])

  useEffect(() => {
    if (!isActive) return
    const timer = setTimeout(measure, 80)
    return () => clearTimeout(timer)
  }, [isActive, measure, remeasureTick])

  return (
    <View ref={ref} collapsable={false} onLayout={measure} className={className} {...props}>
      {children}
    </View>
  )
}
