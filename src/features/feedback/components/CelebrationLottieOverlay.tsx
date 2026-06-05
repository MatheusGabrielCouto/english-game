import { StyleSheet, View } from 'react-native'

import { useAchievementsStore } from '@/features/achievements/store/achievements-store'
import { useCityStore } from '@/features/city/store/city-store'
import { useTitlesStore } from '@/features/titles/store/titles-store'

import { useFeedbackStore } from '../store/feedback-store'
import { CelebrationLottie } from './CelebrationLottie'
import { Confetti } from './Confetti'

/**
 * Tier 1 — confetti full-screen para eventos leves (loot, contrato, título, cidade).
 * Modais bloqueantes usam Lottie próprio (level up, conquista, evolução).
 */
export const CelebrationLottieOverlay = () => {
  const achievementCelebration = useAchievementsStore((state) => state.celebration)
  const titleCelebration = useTitlesStore((state) => state.celebration)
  const cityCelebration = useCityStore((state) => state.celebration)
  const showConfetti = useFeedbackStore((state) => state.showConfetti)
  const activeLevelUp = useFeedbackStore((state) => state.activeLevelUp)
  const petEvolution = useFeedbackStore((state) => state.petEvolution)
  const prestigeCelebration = useFeedbackStore((state) => state.prestigeCelebration)

  const hasLegacyCelebration = Boolean(titleCelebration || cityCelebration)
  const hasBlockingModal = Boolean(
    activeLevelUp || petEvolution || prestigeCelebration || achievementCelebration,
  )
  const active = (showConfetti || hasLegacyCelebration) && !hasBlockingModal

  if (!active) return null

  return (
    <View style={styles.layer} pointerEvents="none">
      <CelebrationLottie kind="confetti" active={active} />
      <Confetti active count={12} />
    </View>
  )
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
    elevation: 40,
  },
})
