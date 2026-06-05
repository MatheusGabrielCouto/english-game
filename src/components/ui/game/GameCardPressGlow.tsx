import { StyleSheet } from 'react-native'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { GAME_CARD_PRESS_GLOW, type GameCardVariant } from '@/constants/game-card-press-ui'
import { useGameCardPressIntensity } from './GameCardPressContext'

type GameCardPressGlowProps = {
  variant: GameCardVariant
}

export const GameCardPressGlow = ({ variant }: GameCardPressGlowProps) => {
  const intensity = useGameCardPressIntensity()
  const config = GAME_CARD_PRESS_GLOW[variant]

  const rippleStyle = useAnimatedStyle(() => {
    if (!intensity) return { opacity: 0 }

    return {
      opacity: interpolate(intensity.value, [0, 0.25, 1], [0, 0.45, 0]),
      transform: [
        {
          scale: interpolate(intensity.value, [0, 1], [0.94, config.rippleScaleTo]),
        },
      ],
    }
  })

  const borderStyle = useAnimatedStyle(() => {
    if (!intensity) return { opacity: 0 }

    return {
      opacity: interpolate(intensity.value, [0, 1], [0, config.borderOpacityTo]),
    }
  })

  if (!intensity) return null

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[styles.ripple, { backgroundColor: config.ripple }, rippleStyle]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.border, { borderColor: config.border }, borderStyle]}
      />
    </>
  )
}

const styles = StyleSheet.create({
  ripple: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
  },
  border: {
    ...StyleSheet.absoluteFill,
    borderRadius: 20,
    borderWidth: 2,
  },
})
