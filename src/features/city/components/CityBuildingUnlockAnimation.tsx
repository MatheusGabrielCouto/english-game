import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

import { theme } from '@/constants'

import {
    CITY_BUILDING_UNLOCK_ANIMATION_MS,
    CITY_MESSAGES,
} from '../constants/default-buildings'

const BUILDING_HEIGHT = 72
const BUILDING_WIDTH = 56
const PROGRESS_TRACK_WIDTH = 160

type CityBuildingUnlockAnimationProps = {
  buildingIcon: string
  buildingName: string
  onConstructComplete: () => void
}

export const CityBuildingUnlockAnimation = ({
  buildingIcon,
  buildingName,
  onConstructComplete,
}: CityBuildingUnlockAnimationProps) => {
  const buildProgress = useSharedValue(0)
  const craneBob = useSharedValue(0)

  useEffect(() => {
    buildProgress.value = 0
    craneBob.value = 0

    craneBob.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 320, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 320, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )

    buildProgress.value = withTiming(
      1,
      { duration: CITY_BUILDING_UNLOCK_ANIMATION_MS, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(onConstructComplete)()
        }
      },
    )
  }, [buildingIcon, buildingName, buildProgress, craneBob, onConstructComplete])

  const columnStyle = useAnimatedStyle(() => ({
    height: interpolate(buildProgress.value, [0, 1], [0, BUILDING_HEIGHT]),
    opacity: interpolate(buildProgress.value, [0, 0.08], [0, 1]),
  }))

  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(buildProgress.value, [0.72, 1], [0, 1]),
    transform: [{ scale: interpolate(buildProgress.value, [0.72, 1], [0.55, 1]) }],
  }))

  const craneStyle = useAnimatedStyle(() => ({
    opacity: interpolate(buildProgress.value, [0, 0.65, 1], [1, 1, 0]),
    transform: [{ translateY: craneBob.value }],
  }))

  const sparkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(buildProgress.value, [0.2, 0.55, 0.9], [0, 1, 0]),
    transform: [{ translateY: interpolate(buildProgress.value, [0.2, 0.9], [6, -10]) }],
  }))

  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(buildProgress.value, [0, 1], [8, PROGRESS_TRACK_WIDTH]),
  }))

  return (
    <View className="items-center gap-4 py-4" accessibilityLabel={CITY_MESSAGES.constructingHint(buildingName)}>
      <View className="h-32 w-full items-center justify-end">
        <Animated.View style={craneStyle} className="mb-1">
          <Text className="text-3xl">🏗️</Text>
        </Animated.View>

        <Animated.View style={sparkStyle} className="absolute top-6">
          <Text className="text-lg">✨</Text>
        </Animated.View>

        <Animated.View style={iconStyle} className="mb-2">
          <Text className="text-5xl">{buildingIcon}</Text>
        </Animated.View>

        <Animated.View
          style={[
            columnStyle,
            {
              width: BUILDING_WIDTH,
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              backgroundColor: theme.colors.accent,
            },
          ]}
        />

        <View
          className="mt-0 h-2.5 w-40 rounded-full bg-border"
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: 0 }}>
          <Animated.View
            style={[progressStyle, { backgroundColor: theme.colors.accent }]}
            className="h-2.5 rounded-full"
          />
        </View>
      </View>

      <Text className="text-center text-sm font-bold text-accent">
        {CITY_MESSAGES.constructingHint(buildingName)}
      </Text>
      <Text className="text-center text-xs text-muted">{CITY_MESSAGES.constructing}</Text>
    </View>
  )
}
