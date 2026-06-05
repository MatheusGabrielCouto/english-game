import { useEffect } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import Animated, {
    Easing,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AppImage } from '@/components/ui/AppImage'
import { theme } from '@/constants'
import { fontFamilies } from '@/constants/fonts'

import { SPLASH_COLORS, SPLASH_TIMING, SPLASH_TRANSITION, SPLASH_UI } from './constants/splash-ui'

const logoSource = require('../../../assets/splash-icon.png')
const { height: SCREEN_HEIGHT } = Dimensions.get('window')

type AnimatedSplashProps = {
  exiting: boolean
  onExitComplete: () => void
}

export const AnimatedSplash = ({ exiting, onExitComplete }: AnimatedSplashProps) => {
  const insets = useSafeAreaInsets()
  const backdropOpacity = useSharedValue(1)
  const logoScale = useSharedValue(0.82)
  const logoOpacity = useSharedValue(0)
  const logoTranslateY = useSharedValue(0)
  const logoTranslateX = useSharedValue(0)
  const glowScale = useSharedValue(0.9)
  const glowOpacity = useSharedValue(0.35)
  const ringScale = useSharedValue(0.6)
  const ringOpacity = useSharedValue(0)
  const titleOpacity = useSharedValue(0)
  const titleY = useSharedValue(14)
  const titleScale = useSharedValue(1)
  const taglineOpacity = useSharedValue(0)
  const footerOpacity = useSharedValue(1)
  const progress = useSharedValue(0)
  const dotPhase = useSharedValue(0)

  const logoExitY = SCREEN_HEIGHT * SPLASH_TRANSITION.logoExitTranslateYRatio

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) })
    logoScale.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.back(1.4)) })
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.92, { duration: 1100, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    )
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 1100 }),
        withTiming(0.28, { duration: 1100 }),
      ),
      -1,
      false,
    )
    titleOpacity.value = withDelay(220, withTiming(1, { duration: 500 }))
    titleY.value = withDelay(220, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }))
    taglineOpacity.value = withDelay(420, withTiming(1, { duration: 450 }))
    progress.value = withRepeat(
      withSequence(
        withTiming(0.88, { duration: 1400, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )
    dotPhase.value = withRepeat(withTiming(1, { duration: 900 }), -1, false)
  }, [
    dotPhase,
    glowOpacity,
    glowScale,
    logoOpacity,
    logoScale,
    progress,
    taglineOpacity,
    titleOpacity,
    titleY,
  ])

  useEffect(() => {
    if (!exiting) return

    const exitEasing = Easing.inOut(Easing.cubic)
    const exitMs = SPLASH_TIMING.exitDurationMs

    glowOpacity.value = withTiming(0, { duration: 220 })
    footerOpacity.value = withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) })
    taglineOpacity.value = withTiming(0, { duration: 200 })
    titleOpacity.value = withTiming(0, { duration: 320 })
    titleY.value = withTiming(logoExitY * 0.35, { duration: exitMs, easing: exitEasing })
    titleScale.value = withTiming(0.72, { duration: exitMs, easing: exitEasing })

    ringOpacity.value = withSequence(
      withTiming(0.55, { duration: 120 }),
      withTiming(0, { duration: exitMs - 120, easing: Easing.out(Easing.quad) }),
    )
    ringScale.value = withTiming(SPLASH_TRANSITION.ringBurstScale, {
      duration: exitMs,
      easing: Easing.out(Easing.cubic),
    })

    logoTranslateY.value = withTiming(logoExitY, { duration: exitMs, easing: exitEasing })
    logoTranslateX.value = withTiming(SPLASH_TRANSITION.logoExitTranslateX, {
      duration: exitMs,
      easing: exitEasing,
    })
    logoScale.value = withTiming(SPLASH_TRANSITION.logoExitScale, {
      duration: exitMs,
      easing: exitEasing,
    })
    logoOpacity.value = withTiming(0, { duration: exitMs - 80, easing: Easing.in(Easing.quad) })

    backdropOpacity.value = withTiming(0, { duration: exitMs, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) runOnJS(onExitComplete)()
    })
  }, [
    backdropOpacity,
    exiting,
    footerOpacity,
    glowOpacity,
    logoExitY,
    logoOpacity,
    logoScale,
    logoTranslateX,
    logoTranslateY,
    onExitComplete,
    ringOpacity,
    ringScale,
    taglineOpacity,
    titleOpacity,
    titleScale,
    titleY,
  ])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { translateY: logoTranslateY.value },
      { translateX: logoTranslateX.value },
      { scale: logoScale.value },
    ],
  }))

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }))

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }))

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }, { scale: titleScale.value }],
  }))

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }))

  const footerStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }))

  const barFillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(progress.value, [0, 1], [0.15, 1]) }],
  }))

  const dot0Style = useAnimatedStyle(() => {
    const wave = interpolate(dotPhase.value, [0, 0.33, 0.66, 1], [0.35, 1, 0.35, 0.35])
    return {
      opacity: 0.35 + wave * 0.65,
      transform: [{ translateY: -wave * 4 }],
    }
  })

  const dot1Style = useAnimatedStyle(() => {
    const wave = interpolate(dotPhase.value, [0, 0.33, 0.66, 1], [0.35, 0.35, 1, 0.35])
    return {
      opacity: 0.35 + wave * 0.65,
      transform: [{ translateY: -wave * 4 }],
    }
  })

  const dot2Style = useAnimatedStyle(() => {
    const wave = interpolate(dotPhase.value, [0, 0.33, 0.66, 1], [1, 0.35, 0.35, 1])
    return {
      opacity: 0.35 + wave * 0.65,
      transform: [{ translateY: -wave * 4 }],
    }
  })

  return (
    <View
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      pointerEvents={exiting ? 'none' : 'auto'}
    >
      <Animated.View style={[styles.backdrop, backdropStyle]} />

      <View style={styles.ambientTop} />
      <View style={styles.ambientBottom} />

      <View style={styles.center}>
        <Animated.View style={[styles.glowOuter, glowStyle]} />
        <Animated.View style={[styles.glowInner, glowStyle]} />
        <Animated.View style={[styles.ring, ringStyle]} />
        <Animated.View style={logoStyle}>
          <AppImage
            source={logoSource}
            surface="hero"
            recyclingKey="splash-logo"
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel={SPLASH_UI.title}
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, footerStyle]}>
        <Animated.View style={titleStyle}>
          <Text style={styles.title}>{SPLASH_UI.title}</Text>
        </Animated.View>
        <Animated.View style={taglineStyle}>
          <Text style={styles.tagline}>{SPLASH_UI.tagline}</Text>
        </Animated.View>

        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, barFillStyle]} />
        </View>

        <View style={styles.loadingRow}>
          <Text style={styles.loadingText}>{SPLASH_UI.loading}</Text>
          <View style={styles.dots}>
            <Animated.View style={[styles.dot, dot0Style]} />
            <Animated.View style={[styles.dot, dot1Style]} />
            <Animated.View style={[styles.dot, dot2Style]} />
          </View>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    justifyContent: 'space-between',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SPLASH_COLORS.background,
  },
  ambientTop: {
    position: 'absolute',
    top: -120,
    left: '10%',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: SPLASH_COLORS.glowPrimary,
    opacity: 0.12,
  },
  ambientBottom: {
    position: 'absolute',
    bottom: -80,
    right: '-5%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: SPLASH_COLORS.glowAccent,
    opacity: 0.1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: SPLASH_COLORS.glowPrimary,
    opacity: 0.2,
  },
  glowInner: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: SPLASH_COLORS.glowAccent,
    opacity: 0.15,
  },
  ring: {
    position: 'absolute',
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 2,
    borderColor: SPLASH_COLORS.glowPrimary,
    backgroundColor: 'transparent',
  },
  logo: {
    width: 168,
    height: 168,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 8,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 18,
    lineHeight: 26,
    color: '#fafafa',
    letterSpacing: 0,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: SPLASH_COLORS.track,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 999,
    backgroundColor: SPLASH_COLORS.glowPrimary,
    transformOrigin: 'left',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: SPLASH_COLORS.glowPrimary,
  },
})
