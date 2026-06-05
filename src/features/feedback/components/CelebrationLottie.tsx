import LottieView from 'lottie-react-native'
import { useEffect, useRef } from 'react'
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'

import {
  CELEBRATION_LOTTIE_SOURCES,
  CELEBRATION_LOTTIE_TIMING,
  type CelebrationLottieKind,
} from '../constants/celebration-lottie'

type CelebrationLottieProps = {
  kind: CelebrationLottieKind
  active: boolean
  className?: string
  style?: StyleProp<ViewStyle>
  onFinish?: () => void
}

export const CelebrationLottie = ({
  kind,
  active,
  style,
  onFinish,
}: CelebrationLottieProps) => {
  const ref = useRef<LottieView>(null)
  const timing = CELEBRATION_LOTTIE_TIMING[kind]

  useEffect(() => {
    if (!active) return

    ref.current?.reset()
    ref.current?.play()

    if (timing.loop || !onFinish) return

    const timer = setTimeout(onFinish, timing.durationMs)
    return () => clearTimeout(timer)
  }, [active, kind, onFinish, timing.durationMs, timing.loop])

  if (!active) return null

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <LottieView
        ref={ref}
        source={CELEBRATION_LOTTIE_SOURCES[kind]}
        autoPlay
        loop={timing.loop}
        speed={timing.speed}
        style={styles.animation}
        resizeMode="cover"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
})
