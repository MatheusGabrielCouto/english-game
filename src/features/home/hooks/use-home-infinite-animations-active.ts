import { useIsFocused } from 'expo-router'
import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

import { shouldRunHomeInfiniteAnimations } from '@/features/home/utils/home-infinite-animation-policy'

export const useHomeInfiniteAnimationsActive = (): boolean => {
  const isFocused = useIsFocused()
  const [reduceMotion, setReduceMotion] = useState(false)

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion)
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion)
    return () => subscription.remove()
  }, [])

  return shouldRunHomeInfiniteAnimations(isFocused, reduceMotion)
}
