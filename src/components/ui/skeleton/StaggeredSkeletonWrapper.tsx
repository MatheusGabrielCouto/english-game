import { type ReactNode, useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { cn } from '@/utils'

import { getSkeletonStaggerDelay, SKELETON_STAGGER } from './skeleton-stagger'

type StaggeredSkeletonWrapperProps = {
  staggerIndex: number
  children: ReactNode
  className?: string
}

export const StaggeredSkeletonWrapper = ({
  staggerIndex,
  children,
  className,
}: StaggeredSkeletonWrapperProps) => {
  const opacity = useSharedValue(0)
  const translateY = useSharedValue<number>(SKELETON_STAGGER.enterOffsetY)
  const delay = getSkeletonStaggerDelay(staggerIndex)

  useEffect(() => {
    opacity.value = 0
    translateY.value = SKELETON_STAGGER.enterOffsetY
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: SKELETON_STAGGER.enterDurationMs }),
    )
    translateY.value = withDelay(delay, withSpring(0, SKELETON_STAGGER.enterSpring))
  }, [delay, opacity, staggerIndex, translateY])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }))

  return (
    <Animated.View style={style} className={cn(className)}>
      {children}
    </Animated.View>
  )
}
