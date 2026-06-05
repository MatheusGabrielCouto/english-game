import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { Modal } from '@/components'
import { GameDisplayText } from '@/components/ui/game'
import { LootBoxArtwork } from '@/features/loot-boxes/components/LootBoxArtwork'
import { CelebrationLottie } from '@/features/feedback/components/CelebrationLottie'
import { resolveLootRevealLottieKind } from '@/features/feedback/constants/celebration-lottie'
import { LootBoxRewardType, type LootBoxOpenResult } from '@/types/loot-box'

const getRewardEmoji = (result: LootBoxOpenResult): string => {
  switch (result.reward.type) {
    case LootBoxRewardType.COINS:
      return '🪙'
    case LootBoxRewardType.SHIELD:
      return '🛡️'
    case LootBoxRewardType.LOOT_BOX:
      return '🎁'
    case LootBoxRewardType.SPECIAL:
      return '✨'
    default:
      return '🎉'
  }
}

type LootBoxRevealModalProps = {
  result: LootBoxOpenResult | null
  onClose: () => void
}

const AnimatedReward = ({ result }: { result: LootBoxOpenResult }) => {
  const emojiScale = useSharedValue(0.3)
  const emojiOpacity = useSharedValue(0)
  const labelOpacity = useSharedValue(0)
  const labelTranslateY = useSharedValue(12)
  const lottieKind = resolveLootRevealLottieKind(result.boxRarity, result.reward.rarity)

  useEffect(() => {
    emojiScale.value = withSequence(
      withSpring(1.25, { damping: 8, stiffness: 180 }),
      withSpring(1, { damping: 12, stiffness: 200 }),
    )
    emojiOpacity.value = withTiming(1, { duration: 220 })
    labelOpacity.value = withDelay(280, withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) }))
    labelTranslateY.value = withDelay(
      280,
      withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }),
    )
  }, [emojiOpacity, emojiScale, labelOpacity, labelTranslateY, result.reward.label])

  const emojiStyle = useAnimatedStyle(() => ({
    opacity: emojiOpacity.value,
    transform: [{ scale: emojiScale.value }],
  }))

  const labelStyle = useAnimatedStyle(() => ({
    opacity: labelOpacity.value,
    transform: [{ translateY: labelTranslateY.value }],
  }))

  return (
    <View className="items-center gap-3 py-4">
      <LootBoxArtwork size={120} variant="watermark" className="absolute opacity-80" />
      {lottieKind ? (
        <View style={styles.lottieFrame} pointerEvents="none">
          <CelebrationLottie kind={lottieKind} active />
        </View>
      ) : null}
      <Animated.View style={emojiStyle}>
        <Text className="text-5xl">{getRewardEmoji(result)}</Text>
      </Animated.View>
      <Animated.View style={labelStyle}>
        <GameDisplayText variant="hero" className="text-center">
          {result.reward.label}
        </GameDisplayText>
        {result.reward.amount > 1 ? (
          <Text className="mt-1 text-center text-sm text-foreground-secondary">
            Quantidade: {result.reward.amount}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  )
}

export const LootBoxRevealModal = ({ result, onClose }: LootBoxRevealModalProps) => (
  <Modal
    visible={result !== null}
    onRequestClose={onClose}
    title="Recompensa revelada!"
    description="Parabéns! Você descobriu um prêmio surpresa."
    confirmLabel="Continuar"
    cancelLabel="Fechar"
    onConfirm={onClose}
    onCancel={onClose}>
    {result ? <AnimatedReward result={result} /> : null}
  </Modal>
)

const styles = StyleSheet.create({
  lottieFrame: {
    position: 'absolute',
    top: -24,
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
