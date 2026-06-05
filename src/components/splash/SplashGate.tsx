import * as SplashScreen from 'expo-splash-screen'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated'

import { StartupPerfService } from '@/services/startup-perf-service'

import { AnimatedSplash } from './AnimatedSplash'
import { SPLASH_TIMING } from './constants/splash-ui'

type SplashGateProps = {
  isReady: boolean
  children: ReactNode
}

export const SplashGate = ({ isReady, children }: SplashGateProps) => {
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [exiting, setExiting] = useState(false)
  const readyAtRef = useRef<number | null>(null)
  const nativeHiddenRef = useRef(false)
  const contentOpacity = useSharedValue(0)
  const contentTranslateY = useSharedValue(14)
  const contentScale = useSharedValue(0.98)

  useEffect(() => {
    if (nativeHiddenRef.current) return
    const timer = setTimeout(() => {
      nativeHiddenRef.current = true
      void SplashScreen.hideAsync()
    }, SPLASH_TIMING.nativeHideDelayMs)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isReady) return
    readyAtRef.current = Date.now()
  }, [isReady])

  useEffect(() => {
    if (!isReady || exiting) return

    const tryExit = () => {
      const readyAt = readyAtRef.current ?? Date.now()
      const elapsed = Date.now() - readyAt
      const remaining = Math.max(0, SPLASH_TIMING.minVisibleMs - elapsed)
      const timer = setTimeout(() => setExiting(true), remaining)
      return timer
    }

    const timer = tryExit()
    return () => clearTimeout(timer)
  }, [isReady, exiting])

  useEffect(() => {
    if (!exiting) return

    const enterEasing = Easing.out(Easing.cubic)
    const { contentEnterDelayMs, contentEnterDurationMs } = SPLASH_TIMING

    contentOpacity.value = withDelay(
      contentEnterDelayMs,
      withTiming(1, { duration: contentEnterDurationMs, easing: enterEasing }),
    )
    contentTranslateY.value = withDelay(
      contentEnterDelayMs,
      withTiming(0, { duration: contentEnterDurationMs, easing: enterEasing }),
    )
    contentScale.value = withDelay(
      contentEnterDelayMs,
      withTiming(1, { duration: contentEnterDurationMs, easing: enterEasing }),
    )
  }, [contentOpacity, contentScale, contentTranslateY, exiting])

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }, { scale: contentScale.value }],
  }))

  const handleExitComplete = () => {
    StartupPerfService.mark('splash_overlay_dismissed')
    setOverlayVisible(false)
  }

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[{ flex: 1 }, isReady ? contentStyle : undefined]}>
        {isReady ? children : <View style={{ flex: 1 }} />}
      </Animated.View>
      {overlayVisible ? (
        <AnimatedSplash exiting={exiting} onExitComplete={handleExitComplete} />
      ) : null}
    </View>
  )
}
