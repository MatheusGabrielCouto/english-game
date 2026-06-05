import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { Modal } from '@/components/ui/Modal';
import { GameDisplayText } from '@/components/ui/game';
import { theme } from '@/constants';

import { CelebrationLottie } from './CelebrationLottie';

import { useFeedbackStore } from '../store/feedback-store';

export const LevelUpModal = () => {
  const celebration = useFeedbackStore((state) => state.activeLevelUp);
  const dequeueLevelUp = useFeedbackStore((state) => state.dequeueLevelUp);
  const clearConfetti = useFeedbackStore((state) => state.clearConfetti);

  const scale = useSharedValue(0.6);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!celebration) return;

    scale.value = 0.6;
    glow.value = 0;
    scale.value = withSpring(1, { damping: 10, stiffness: 120 });
    glow.value = withSequence(withTiming(1, { duration: 400 }), withTiming(0.6, { duration: 800 }));
  }, [celebration, glow, scale]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.3 + glow.value * 0.5,
  }));

  const handleClose = () => {
    dequeueLevelUp();
    clearConfetti();
  };

  return (
    <Modal
      visible={celebration !== null}
      onRequestClose={handleClose}
      title="Level Up!"
      description="Você evoluiu na sua jornada de aprendizado."
      confirmLabel="Continuar"
      footerMode="single"
      onConfirm={handleClose}
      className="border-primary/40 bg-surface">
      {celebration ? (
        <View className="items-center gap-4 py-2">
          <View className="absolute h-56 w-56 items-center justify-center">
            <CelebrationLottie kind="sparkle" active />
          </View>
          <Animated.View
            style={[
              badgeStyle,
              {
                shadowColor: theme.colors.gold,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 24,
                elevation: 12,
              },
            ]}
            className="h-28 w-28 items-center justify-center rounded-full border-4 border-gold bg-gold/20">
            <Text className="text-5xl">⬆️</Text>
          </Animated.View>
          <GameDisplayText variant="hero" className="text-center text-gold">
            Nível {celebration.level}
          </GameDisplayText>
          {celebration.levelsGained > 1 ? (
            <Text className="text-center text-sm text-foreground-secondary">
              +{celebration.levelsGained} níveis de uma vez!
            </Text>
          ) : (
            <Text className="text-center text-sm text-foreground-secondary">
              De nível {celebration.previousLevel} para {celebration.level}
            </Text>
          )}
          <View className="w-full rounded-xl border border-primary/30 bg-primary/10 p-4">
            <Text className="text-center text-sm font-semibold text-primary">
              🎁 Recompensa de level up aplicada automaticamente
            </Text>
          </View>
        </View>
      ) : null}
    </Modal>
  );
};
