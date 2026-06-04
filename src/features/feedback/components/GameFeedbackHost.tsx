import { StyleSheet, View } from 'react-native';

import { useFeedbackStore } from '../store/feedback-store';
import { Confetti } from './Confetti';
import { LevelUpModal } from './LevelUpModal';
import { PetEvolutionModal } from './PetEvolutionModal';
import { RewardBurstOverlay } from './RewardBurstOverlay';

export const GameFeedbackHost = () => {
  const showConfetti = useFeedbackStore((state) => state.showConfetti);
  const activeLevelUp = useFeedbackStore((state) => state.activeLevelUp);
  const petEvolution = useFeedbackStore((state) => state.petEvolution);
  const rewardBursts = useFeedbackStore((state) => state.rewardBursts);

  const hasOverlay =
    showConfetti || activeLevelUp || petEvolution || rewardBursts.length > 0;

  if (!hasOverlay) return null;

  return (
    <>
      <View style={styles.effectsLayer} pointerEvents="none">
        <Confetti active={showConfetti} />
        <RewardBurstOverlay />
      </View>
      <LevelUpModal />
      <PetEvolutionModal />
    </>
  );
};

const styles = StyleSheet.create({
  effectsLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 60,
    elevation: 60,
  },
});
