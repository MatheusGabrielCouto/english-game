import { type ReactNode } from 'react'
import { View, type ViewProps } from 'react-native'
import Animated from 'react-native-reanimated'

import {
  heroCardSharedTransition,
  SHARED_ELEMENT_TRANSITIONS_ENABLED,
  type SharedTransitionTag,
} from '@/constants/shared-transitions'

type SharedHeroTransitionProps = ViewProps & {
  tag?: SharedTransitionTag
  children: ReactNode
}

export const SharedHeroTransition = ({
  tag,
  children,
  className,
  style,
  ...props
}: SharedHeroTransitionProps) => {
  if (!tag || !SHARED_ELEMENT_TRANSITIONS_ENABLED) {
    return (
      <View className={className} style={style} {...props}>
        {children}
      </View>
    )
  }

  return (
    <Animated.View
      sharedTransitionTag={tag}
      sharedTransitionStyle={heroCardSharedTransition}
      collapsable={false}
      className={className}
      style={style}
      {...props}>
      {children}
    </Animated.View>
  )
}
