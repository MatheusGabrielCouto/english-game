import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Modal } from '@/components';
import { GameDisplayText } from '@/components/ui/game';
import { theme } from '@/constants';
import { CelebrationLottie } from '@/features/feedback/components/CelebrationLottie';
import { useFeedbackStore } from '@/features/feedback/store/feedback-store';
import { PrestigeSacrificeType } from '@/types/prestige';

import { PRESTIGE_ASCENSION_COPY } from '../constants/prestige-ascension';

export const PrestigeAscensionCelebrationModal = () => {
  const celebration = useFeedbackStore((state) => state.prestigeCelebration);
  const setPrestigeCelebration = useFeedbackStore((state) => state.setPrestigeCelebration);
  const clearConfetti = useFeedbackStore((state) => state.clearConfetti);

  const scale = useSharedValue(0.5);
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!celebration) return;
    scale.value = 0.5;
    glow.value = 0;
    scale.value = withSpring(1, { damping: 9, stiffness: 100 });
    glow.value = withSequence(withTiming(1, { duration: 500 }), withTiming(0.5, { duration: 900 }));
  }, [celebration, glow, scale]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.35 + glow.value * 0.45,
  }));

  const handleClose = () => {
    setPrestigeCelebration(null);
    clearConfetti();
  };

  if (!celebration) return null;

  const sacrificeLabel =
    celebration.sacrifice === PrestigeSacrificeType.COINS
      ? 'Economia zerada'
      : 'Pet reiniciado';

  return (
    <Modal
      visible
      onRequestClose={handleClose}
      title={PRESTIGE_ASCENSION_COPY.celebrationTitle}
      description={PRESTIGE_ASCENSION_COPY.celebrationSubtitle}
      confirmLabel="Nova run"
      footerMode="single"
      onConfirm={handleClose}
      className="border-gold/40">
      <View className="items-center gap-4 py-2">
        <View className="absolute h-56 w-56 items-center justify-center">
          <CelebrationLottie kind="prestige" active />
        </View>
        <Animated.View
          style={[
            badgeStyle,
            {
              shadowColor: theme.colors.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 24,
            },
          ]}
          className="h-24 w-24 items-center justify-center rounded-full border-4 border-gold bg-gold/15">
          <Text className="text-4xl font-black text-gold">{celebration.tierRoman}</Text>
        </Animated.View>

        <GameDisplayText variant="hero" className="text-center">
          {celebration.tierName}
        </GameDisplayText>
        <Text className="text-center text-sm text-muted">Sacrifício: {sacrificeLabel}</Text>

        <View className="w-full gap-1 rounded-xl border border-primary/25 bg-primary/10 px-4 py-3">
          {celebration.permanentBonuses.map((line) => (
            <Text key={line} className="text-center text-sm text-foreground">
              {line}
            </Text>
          ))}
        </View>
      </View>
    </Modal>
  );
};
