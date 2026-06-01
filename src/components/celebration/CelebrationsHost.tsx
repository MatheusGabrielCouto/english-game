import { StyleSheet, View } from 'react-native';

import { AchievementUnlockModal } from '@/features/achievements/components/AchievementUnlockModal';
import { useAchievementsStore } from '@/features/achievements/store/achievements-store';
import { CityUnlockModal } from '@/features/city/components/CityUnlockModal';
import { useCityStore } from '@/features/city/store/city-store';
import { Confetti } from '@/features/feedback/components/Confetti';
import { LevelUpModal } from '@/features/feedback/components/LevelUpModal';
import { PetEvolutionModal } from '@/features/feedback/components/PetEvolutionModal';
import { PrestigeAscensionCelebrationModal } from '@/features/prestige/components/PrestigeAscensionCelebrationModal';
import { RewardBurstOverlay } from '@/features/feedback/components/RewardBurstOverlay';
import { useFeedbackStore } from '@/features/feedback/store/feedback-store';
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
  const hasFeedback =
    showConfetti ||
    activeLevelUp ||
    petEvolution ||
    prestigeCelebration ||
    rewardBursts.length > 0 ||
    hasLegacyCelebration;

  if (!hasFeedback) return null;

  return (
    <View style={styles.host} pointerEvents="box-none">
      <Confetti active={showConfetti || hasLegacyCelebration} />
      <RewardBurstOverlay />
      <LevelUpModal />
      <PetEvolutionModal />
      {achievementCelebration ? <AchievementUnlockModal /> : null}
      {titleCelebration ? <TitleUnlockModal /> : null}
      {cityCelebration ? <CityUnlockModal /> : null}
      {prestigeCelebration ? <PrestigeAscensionCelebrationModal /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 50,
    elevation: 50,
  },
});
