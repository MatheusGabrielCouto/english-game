import { useEffect, useRef } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { AppIcon } from '@/components/ui/AppIcon'
import { theme } from '@/constants'
import { cn } from '@/utils'

import { MISSION_COMPLETE_ANIM } from '../constants/mission-complete-ui'

type MissionIconMorphProps = {
  categoryIcon: string
  completed: boolean
  className?: string
}

export const MissionIconMorph = ({ categoryIcon, completed, className }: MissionIconMorphProps) => {
  const playedRef = useRef(false)
  const categoryOpacity = useSharedValue(1)
  const categoryScale = useSharedValue(1)
  const checkOpacity = useSharedValue(0)
  const checkScale = useSharedValue(0.35)
  const ringScale = useSharedValue(0.85)

  useEffect(() => {
    if (!completed) {
      playedRef.current = false
      categoryOpacity.value = 1
      categoryScale.value = 1
      checkOpacity.value = 0
      checkScale.value = 0.35
      ringScale.value = 0.85
      return
    }

    if (playedRef.current) return
    playedRef.current = true

    const { morphDurationMs, checkSpring } = MISSION_COMPLETE_ANIM

    categoryOpacity.value = withTiming(0, { duration: morphDurationMs })
    categoryScale.value = withTiming(0.55, { duration: morphDurationMs })
    checkOpacity.value = withDelay(90, withTiming(1, { duration: morphDurationMs }))
    checkScale.value = withDelay(90, withSpring(1, checkSpring))
    ringScale.value = withDelay(90, withSpring(1, { damping: 14, stiffness: 240 }))
  }, [categoryOpacity, categoryScale, checkOpacity, checkScale, completed, ringScale])

  const categoryStyle = useAnimatedStyle(() => ({
    opacity: categoryOpacity.value,
    transform: [{ scale: categoryScale.value }],
  }))

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [{ scale: checkScale.value }],
  }))

  const ringStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value * 0.55,
    transform: [{ scale: ringScale.value }],
  }))

  return (
    <View
      className={cn(
        'h-11 w-11 items-center justify-center rounded-2xl border',
        completed ? 'border-success/40 bg-success/15' : 'border-primary/30 bg-primary/10',
        className,
      )}>
      <Animated.View
        style={[ringStyle, { position: 'absolute', width: 36, height: 36, borderRadius: 18 }]}
        className="border-2 border-success/50 bg-success/10"
      />
      <Animated.View style={[categoryStyle, { position: 'absolute' }]}>
        <Text className="text-xl">{categoryIcon}</Text>
      </Animated.View>
      <Animated.View style={checkStyle}>
        <AppIcon name="checkmark-circle" size={28} color={theme.colors.success} />
      </Animated.View>
    </View>
  )
}
