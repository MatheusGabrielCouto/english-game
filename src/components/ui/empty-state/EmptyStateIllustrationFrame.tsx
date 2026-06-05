import { type ReactNode, useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { cn } from '@/utils'

type EmptyStateIllustrationFrameProps = {
  children: ReactNode
  className?: string
  size?: number
}

export const EmptyStateIllustrationFrame = ({
  children,
  className,
  size = 148,
}: EmptyStateIllustrationFrameProps) => {
  const floatY = useSharedValue(0)

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
        withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [floatY])

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }))

  return (
    <View
      className={cn('items-center justify-center', className)}
      style={{ width: size, height: size }}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Animated.View style={floatStyle}>{children}</Animated.View>
    </View>
  )
}
