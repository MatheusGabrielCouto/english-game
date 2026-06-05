import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import { MISSION_COMPLETE_ANIM } from '../constants/mission-complete-ui'

type FloatingCoinProps = {
  delayMs: number
  offsetX: number
}

const FloatingCoin = ({ delayMs, offsetX }: FloatingCoinProps) => {
  const translateY = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.7)

  useEffect(() => {
    translateY.value = 0
    opacity.value = 0
    scale.value = 0.7

    opacity.value = withDelay(delayMs, withTiming(1, { duration: 120 }))
    scale.value = withDelay(delayMs, withTiming(1, { duration: 180 }))
    translateY.value = withDelay(
      delayMs,
      withTiming(MISSION_COMPLETE_ANIM.coinFloatDistance, {
        duration: MISSION_COMPLETE_ANIM.coinFloatDurationMs,
      }),
    )
    opacity.value = withDelay(
      delayMs + 280,
      withTiming(0, { duration: MISSION_COMPLETE_ANIM.coinFloatDurationMs - 280 }),
    )
  }, [delayMs, opacity, scale, translateY])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }, { translateX: offsetX }],
  }))

  return (
    <Animated.View style={[styles.coin, style]} pointerEvents="none">
      <Text style={styles.coinEmoji}>🪙</Text>
    </Animated.View>
  )
}

type MissionCoinFloatProps = {
  active: boolean
}

export const MissionCoinFloat = ({ active }: MissionCoinFloatProps) => {
  if (!active) return null

  return (
    <View style={styles.host} pointerEvents="none">
      {MISSION_COMPLETE_ANIM.coinFloatDelaysMs.map((delayMs, index) => (
        <FloatingCoin
          key={`${delayMs}-${index}`}
          delayMs={delayMs}
          offsetX={(index - 1) * 14}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  coin: {
    position: 'absolute',
    top: '50%',
    marginTop: -10,
  },
  coinEmoji: {
    fontSize: 16,
    lineHeight: 20,
  },
})
