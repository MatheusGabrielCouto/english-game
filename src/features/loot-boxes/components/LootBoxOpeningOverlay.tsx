import { useEffect } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated'

import { LOOT_BOX_RARITY_CONFIG } from '@/features/inventory/constants'
import { AudioDirector } from '@/services/audio'
import type { LootBoxRarityValue } from '@/types/inventory'
import { haptics } from '@/utils/haptics'

const RARITY_GLOW: Record<LootBoxRarityValue, string> = {
  common: 'rgba(148, 163, 184, 0.45)',
  uncommon: 'rgba(74, 222, 128, 0.5)',
  rare: 'rgba(56, 189, 248, 0.55)',
  epic: 'rgba(168, 85, 247, 0.6)',
  legendary: 'rgba(251, 191, 36, 0.65)',
  mythic: 'rgba(250, 204, 21, 0.7)',
  ancient: 'rgba(248, 113, 113, 0.65)',
}

type LootBoxOpeningOverlayProps = {
  visible: boolean
  rarity: LootBoxRarityValue
  onFinished: () => void
}

const SPARKLE_OFFSETS = [
  { top: 0, left: '50%' as const, marginLeft: -9 },
  { top: '38%' as const, right: -4 },
  { top: '38%' as const, left: -4 },
  { bottom: 8, left: '50%' as const, marginLeft: -9 },
]

const Sparkle = ({ delay, index }: { delay: number; index: number }) => {
  const opacity = useSharedValue(0)
  const offset = useSharedValue(0)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 400 })),
        4,
        false,
      ),
    )
    offset.value = withDelay(
      delay,
      withRepeat(withTiming(20, { duration: 600, easing: Easing.out(Easing.ease) }), 4, false),
    )
  }, [delay, offset, opacity])

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: -offset.value }],
  }))

  return (
    <Animated.View style={[styles.sparkle, SPARKLE_OFFSETS[index], style]}>
      <Text style={styles.sparkleText}>✦</Text>
    </Animated.View>
  )
}

export const LootBoxOpeningOverlay = ({
  visible,
  rarity,
  onFinished,
}: LootBoxOpeningOverlayProps) => {
  const config = LOOT_BOX_RARITY_CONFIG[rarity]
  const glowColor = RARITY_GLOW[rarity]

  const shakeX = useSharedValue(0)
  const boxScale = useSharedValue(1)
  const boxRotate = useSharedValue(0)
  const ringScale = useSharedValue(0.6)
  const ringOpacity = useSharedValue(0)
  const backdropOpacity = useSharedValue(0)
  const statusOpacity = useSharedValue(0)

  useEffect(() => {
    if (!visible) {
      shakeX.value = 0
      boxScale.value = 1
      boxRotate.value = 0
      ringScale.value = 0.6
      ringOpacity.value = 0
      backdropOpacity.value = 0
      statusOpacity.value = 0
      return
    }

    haptics.medium()
    void AudioDirector.playSFX('loot_shake', { family: 'loot_shake', priority: 'high' })
    backdropOpacity.value = withTiming(1, { duration: 200 })
    statusOpacity.value = withDelay(100, withTiming(1, { duration: 250 }))

    shakeX.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-8, { duration: 55 }),
        withTiming(8, { duration: 55 }),
        withTiming(0, { duration: 55 }),
      ),
      3,
      false,
    )

    boxRotate.value = withDelay(
      900,
      withSequence(
        withTiming(-6, { duration: 80 }),
        withTiming(6, { duration: 80 }),
        withTiming(0, { duration: 80 }),
      ),
    )

    ringOpacity.value = withDelay(
      850,
      withSequence(withTiming(1, { duration: 200 }), withTiming(0, { duration: 350 })),
    )

    ringScale.value = withDelay(
      850,
      withTiming(2.2, { duration: 550, easing: Easing.out(Easing.cubic) }),
    )

    boxScale.value = withDelay(
      900,
      withSequence(
        withTiming(1.12, { duration: 180, easing: Easing.out(Easing.ease) }),
        withTiming(0.92, { duration: 120 }),
        withTiming(1.35, { duration: 280, easing: Easing.out(Easing.back(1.6)) }),
        withTiming(0, { duration: 220, easing: Easing.in(Easing.ease) }, (finished) => {
          if (finished) {
            runOnJS(haptics.success)()
            runOnJS(onFinished)()
          }
        }),
      ),
    )

    statusOpacity.value = withDelay(1700, withTiming(0, { duration: 200 }))
  }, [
    backdropOpacity,
    boxRotate,
    boxScale,
    onFinished,
    ringOpacity,
    ringScale,
    shakeX,
    statusOpacity,
    visible,
  ])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const boxStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { scale: boxScale.value },
      { rotate: `${boxRotate.value}deg` },
    ],
  }))

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }],
  }))

  const statusStyle = useAnimatedStyle(() => ({
    opacity: statusOpacity.value,
  }))

  if (!visible) return null

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={() => {}}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]} />

        <View style={styles.stage}>
          <Animated.View
            style={[styles.glowRing, ringStyle, { borderColor: glowColor, shadowColor: glowColor }]}
          />

          <View style={styles.sparkleRing}>
            <Sparkle delay={200} index={0} />
            <Sparkle delay={450} index={1} />
            <Sparkle delay={700} index={2} />
            <Sparkle delay={950} index={3} />
          </View>

          <Animated.View style={[styles.boxWrap, boxStyle]}>
            <View style={[styles.boxCard, { borderColor: glowColor }]}>
              <Text style={styles.boxEmoji}>{config.emoji}</Text>
            </View>
          </Animated.View>

          <Animated.View style={statusStyle}>
            <Text style={styles.statusLabel}>{config.label}</Text>
            <Text style={styles.statusText}>Abrindo...</Text>
          </Animated.View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
  },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    borderWidth: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 12,
  },
  sparkleRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  sparkleText: {
    fontSize: 18,
    color: '#fbbf24',
  },
  boxWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxCard: {
    width: 128,
    height: 128,
    borderRadius: 28,
    borderWidth: 2,
    backgroundColor: 'rgba(30, 30, 40, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxEmoji: {
    fontSize: 72,
    lineHeight: 80,
  },
  statusLabel: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  statusText: {
    marginTop: 6,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#f8fafc',
  },
})
