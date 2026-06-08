import { useEffect, useRef } from 'react'
import { Animated, Easing, View } from 'react-native'

import { theme } from '@/constants'

const DOT_SIZE = 7

const TypingDot = ({ delay }: { delay: number }) => {
  const progress = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(progress, {
          toValue: 1,
          duration: 320,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 320,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(160),
      ]),
    )

    animation.start()
    return () => animation.stop()
  }, [delay, progress])

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -5],
  })

  const opacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 1],
  })

  return (
    <Animated.View
      style={{
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
        backgroundColor: theme.colors.foregroundSecondary,
        opacity,
        transform: [{ translateY }],
      }}
    />
  )
}

export const MentorChatTypingIndicator = () => (
  <View className="max-w-[80%] self-start" accessibilityRole="text" accessibilityLabel="Atlas está digitando">
    <View className="flex-row items-center gap-1.5 rounded-2xl rounded-bl-md border border-border/70 bg-surface-elevated px-4 py-3.5">
      <TypingDot delay={0} />
      <TypingDot delay={160} />
      <TypingDot delay={320} />
    </View>
  </View>
)
