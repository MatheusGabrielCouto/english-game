import { useEffect } from 'react'
import { Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { PET_UI } from '../constants/pet-ui'
import type { PetRecommendedAction } from '../utils/get-pet-recommended-action'

type PetBestActionHighlightProps = {
  action: PetRecommendedAction
  compact?: boolean
}

export const PetBestActionHighlight = ({ action, compact = false }: PetBestActionHighlightProps) => {
  const glow = useSharedValue(0.55)

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.45, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
  }, [glow])

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }))

  return (
    <View
      className={
        compact
          ? 'overflow-hidden rounded-2xl border border-primary/35 bg-primary/8 px-3 py-2.5'
          : 'overflow-hidden rounded-2xl border border-primary/35 bg-primary/8 px-4 py-3'
      }
      accessibilityRole="text"
      accessibilityLabel={`${PET_UI.bestActionTitle}: ${action.label}. ${action.reason}`}>
      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 rounded-2xl border-2 border-primary/50"
        style={glowStyle}
      />

      <Text className="text-[10px] font-black uppercase tracking-[0.18em] text-primary">
        {PET_UI.bestActionTitle}
      </Text>
      <View className="mt-1.5 flex-row items-center gap-2">
        <Text className={compact ? 'text-xl' : 'text-2xl'}>{action.emoji}</Text>
        <View className="min-w-0 flex-1">
          <Text className="text-sm font-bold text-foreground">{action.label}</Text>
          <Text className="text-xs leading-4 text-foreground-secondary">{action.reason}</Text>
        </View>
      </View>
    </View>
  )
}
