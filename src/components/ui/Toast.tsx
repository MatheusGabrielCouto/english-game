import { useCallback, useEffect, useRef, useState } from 'react'
import { Text } from 'react-native'
import Animated, {
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { cn } from '@/utils'

type ToastVariant = 'success' | 'info' | 'warning' | 'error'

type ToastProps = {
  message: string | null
  onDismiss: () => void
  durationMs?: number
  variant?: ToastVariant
  /** Changes when a new toast is shown; keeps the dismiss timer from resetting on parent re-renders. */
  toastKey?: string | number
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-success/40 bg-success/20',
  info: 'border-primary/40 bg-primary/20',
  warning: 'border-warning/40 bg-warning/15',
  error: 'border-danger/40 bg-danger/15',
}

const ENTER_OFFSET = -24
const EXIT_OFFSET = -14
const ENTER_SPRING = { damping: 16, stiffness: 220, mass: 0.85 }
const EXIT_SPRING = { damping: 22, stiffness: 300, mass: 0.9 }

const runVariantAccent = (
  variant: ToastVariant,
  translateX: SharedValue<number>,
  pulseScale: SharedValue<number>,
) => {
  translateX.value = 0
  pulseScale.value = 1

  if (variant === 'success') {
    translateX.value = withDelay(
      120,
      withSequence(
        withTiming(5, { duration: 55 }),
        withTiming(-4, { duration: 55 }),
        withTiming(2.5, { duration: 45 }),
        withSpring(0, { damping: 14, stiffness: 380 }),
      ),
    )
    return
  }

  if (variant === 'error') {
    pulseScale.value = withDelay(
      100,
      withSequence(
        withTiming(1.06, { duration: 110 }),
        withTiming(0.97, { duration: 90 }),
        withSpring(1, { damping: 12, stiffness: 340 }),
      ),
    )
  }
}

export const Toast = ({
  message,
  onDismiss,
  durationMs = 3000,
  variant = 'success',
  toastKey,
}: ToastProps) => {
  const insets = useSafeAreaInsets()
  const onDismissRef = useRef(onDismiss)
  onDismissRef.current = onDismiss

  const displayRef = useRef<string | null>(null)
  const isExitingRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [displayMessage, setDisplayMessage] = useState<string | null>(null)
  const [displayVariant, setDisplayVariant] = useState<ToastVariant>(variant)

  const translateY = useSharedValue(ENTER_OFFSET)
  const translateX = useSharedValue(0)
  const opacity = useSharedValue(0)
  const scale = useSharedValue(0.94)
  const pulseScale = useSharedValue(1)

  const finishDismiss = useCallback(() => {
    isExitingRef.current = false
    displayRef.current = null
    setDisplayMessage(null)
    onDismissRef.current()
  }, [])

  const runExit = useCallback(() => {
    if (isExitingRef.current || !displayRef.current) return

    isExitingRef.current = true

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    translateX.value = withTiming(0, { duration: 120 })
    pulseScale.value = withTiming(1, { duration: 120 })
    translateY.value = withSpring(EXIT_OFFSET, EXIT_SPRING)
    scale.value = withTiming(0.96, { duration: 200 })
    opacity.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) runOnJS(finishDismiss)()
    })
  }, [finishDismiss, opacity, pulseScale, scale, translateX, translateY])

  const runEnter = useCallback(
    (enterVariant: ToastVariant) => {
      isExitingRef.current = false
      translateY.value = ENTER_OFFSET
      translateX.value = 0
      opacity.value = 0
      scale.value = 0.94
      pulseScale.value = 1

      translateY.value = withSpring(0, ENTER_SPRING)
      scale.value = withSpring(1, ENTER_SPRING)
      opacity.value = withTiming(1, { duration: 180 })
      runVariantAccent(enterVariant, translateX, pulseScale)
    },
    [opacity, pulseScale, scale, translateX, translateY],
  )

  useEffect(() => {
    if (!message) {
      if (displayRef.current) runExit()
      return
    }

    displayRef.current = message
    setDisplayMessage(message)
    setDisplayVariant(variant)
    runEnter(variant)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => runExit(), durationMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [message, durationMs, toastKey, variant, runEnter, runExit])

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value * pulseScale.value },
    ],
  }))

  if (!displayMessage) return null

  return (
    <Animated.View
      style={[{ top: insets.top + 12 }, animatedStyle]}
      className="absolute left-4 right-4 z-50"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <Animated.View
        className={cn(
          'rounded-xl border px-4 py-3 shadow-lg',
          VARIANT_STYLES[displayVariant],
        )}>
        <Text className="text-center text-sm font-medium text-foreground">{displayMessage}</Text>
      </Animated.View>
    </Animated.View>
  )
}
