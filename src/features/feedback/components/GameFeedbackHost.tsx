import { StyleSheet, View } from 'react-native';

import { Confetti } from './Confetti';
import { LevelUpModal } from './LevelUpModal';
import { PetEvolutionModal } from './PetEvolutionModal';
import { RewardBurstOverlay } from './RewardBurstOverlay';
import { useFeedbackStore } from '../store/feedback-store';

export const GameFeedbackHost = () => {
  const showConfetti = useFeedbackStore((state) => state.showConfetti);
  const activeLevelUp = useFeedbackStore((state) => state.activeLevelUp);
  const petEvolution = useFeedbackStore((state) => state.petEvolution);
  const rewardBursts = useFeedbackStore((state) => state.rewardBursts);

  const hasOverlay =
    showConfetti || activeLevelUp || petEvolution || rewardBursts.length > 0;

  if (!hasOverlay) return null;

  return (
    <View style={styles.host} pointerEvents="box-none">
      <Confetti active={showConfetti} />
      <RewardBurstOverlay />
      <LevelUpModal />
      <PetEvolutionModal />
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFill,
    zIndex: 60,
    elevation: 60,
  },
});
