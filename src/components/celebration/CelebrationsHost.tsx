import { StyleSheet, View } from 'react-native';

import { AchievementUnlockModal } from '@/features/achievements/components/AchievementUnlockModal';
import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import { CityUnlockModal } from '@/features/city/components/CityUnlockModal';
import { useCityStore } from '@/features/city/store/city-store';
import { Confetti } from '@/features/feedback/components/Confetti';
import { LevelUpModal } from '@/features/feedback/components/LevelUpModal';
import { PetEvolutionModal } from '@/features/feedback/components/PetEvolutionModal';
import { RewardBurstOverlay } from '@/features/feedback/components/RewardBurstOverlay';
import { useFeedbackStore } from '@/features/feedback/store/feedback-store';
import { PrestigeAscensionCelebrationModal } from '@/features/prestige/components/PrestigeAscensionCelebrationModal';
import { TitleUnlockModal } from '@/features/titles/components/TitleUnlockModal';
import { useTitlesStore } from '@/features/titles/store/titles-store';

export const CelebrationsHost = () => {
  const achievementCelebration = useAchievementsStore((state) => state.celebration);
  const titleCelebration = useTitlesStore((state) => state.celebration);
  const cityCelebration = useCityStore((state) => state.celebration);
  const showConfetti = useFeedbackStore((state) => state.showConfetti);
  const activeLevelUp = useFeedbackStore((state) => state.activeLevelUp);
  const petEvolution = useFeedbackStore((state) => state.petEvolution);
  const rewardBursts = useFeedbackStore((state) => state.rewardBursts);
  const prestigeCelebration = useFeedbackStore((state) => state.prestigeCelebration);

  const hasLegacyCelebration = Boolean(achievementCelebration || titleCelebration || cityCelebration);
  const hasTransientEffects =
    showConfetti || rewardBursts.length > 0 || hasLegacyCelebration;
  const hasBlockingModal = Boolean(
    activeLevelUp || petEvolution || prestigeCelebration || hasLegacyCelebration,
  );

  if (!hasTransientEffects && !hasBlockingModal) return null;

  return (
    <>
      {hasTransientEffects ? (
        <View style={styles.effectsLayer} pointerEvents="none">
          <Confetti active={showConfetti || hasLegacyCelebration} />
          <RewardBurstOverlay />
        </View>
      ) : null}
      <LevelUpModal />
      <PetEvolutionModal />
      {achievementCelebration ? <AchievementUnlockModal /> : null}
      {titleCelebration ? <TitleUnlockModal /> : null}
      {cityCelebration ? <CityUnlockModal /> : null}
      {prestigeCelebration ? <PrestigeAscensionCelebrationModal /> : null}
    </>
  );
};

const styles = StyleSheet.create({
  effectsLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    elevation: 50,
  },
});
