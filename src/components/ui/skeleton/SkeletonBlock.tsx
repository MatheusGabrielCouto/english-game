import { useEffect } from 'react'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated'

import { cn } from '@/utils'

const SHIMMER_MIN = 0.42
const SHIMMER_MAX = 0.88
const SHIMMER_DURATION_MS = 1100

type SkeletonBlockProps = {
  className?: string
  animated?: boolean
}

export const SkeletonBlock = ({ className, animated = true }: SkeletonBlockProps) => {
  const opacity = useSharedValue(SHIMMER_MIN)

  useEffect(() => {
    if (!animated) {
      opacity.value = 1
      return
    }

    opacity.value = withRepeat(
      withTiming(SHIMMER_MAX, {
        duration: SHIMMER_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    )
  }, [animated, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animated ? opacity.value : 1,
  }))

  return (
    <Animated.View
      style={animatedStyle}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className={cn('rounded bg-surface-elevated', className)}
    />
  )
}
