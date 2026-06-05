import { useEffect } from 'react'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

import { cn } from '@/utils'

import { getSkeletonStaggerDelay, SKELETON_STAGGER } from './skeleton-stagger'

const SHIMMER_MIN = 0.42
const SHIMMER_MAX = 0.88
const SHIMMER_DURATION_MS = 1100

type SkeletonBlockProps = {
  className?: string
  animated?: boolean
  /** Offsets shimmer phase for cascade effect across list rows. */
  staggerIndex?: number
}

export const SkeletonBlock = ({
  className,
  animated = true,
  staggerIndex = 0,
}: SkeletonBlockProps) => {
  const opacity = useSharedValue(SHIMMER_MIN)
  const shimmerDelay = getSkeletonStaggerDelay(staggerIndex, SKELETON_STAGGER.blockStepMs)

  useEffect(() => {
    if (!animated) {
      opacity.value = 1
      return
    }

    opacity.value = SHIMMER_MIN
    opacity.value = withDelay(
      shimmerDelay,
      withRepeat(
        withTiming(SHIMMER_MAX, {
          duration: SHIMMER_DURATION_MS,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      ),
    )
  }, [animated, opacity, shimmerDelay])

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
