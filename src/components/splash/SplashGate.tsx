import * as SplashScreen from 'expo-splash-screen'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { View } from 'react-native'

import { SPLASH_TIMING } from './constants/splash-ui'
import { AnimatedSplash } from './AnimatedSplash'

type SplashGateProps = {
  isReady: boolean
  children: ReactNode
}

export const SplashGate = ({ isReady, children }: SplashGateProps) => {
  const [overlayVisible, setOverlayVisible] = useState(true)
  const [exiting, setExiting] = useState(false)
  const readyAtRef = useRef<number | null>(null)
  const nativeHiddenRef = useRef(false)

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

  const handleExitComplete = () => {
    setOverlayVisible(false)
  }

  return (
    <View style={{ flex: 1 }}>
      {isReady ? children : <View style={{ flex: 1 }} />}
      {overlayVisible ? (
        <AnimatedSplash exiting={exiting} onExitComplete={handleExitComplete} />
      ) : null}
    </View>
  )
}
