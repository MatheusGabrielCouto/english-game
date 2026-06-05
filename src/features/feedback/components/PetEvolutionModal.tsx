import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components';
import { theme } from '@/constants';
import { EvolutionBurstParticles } from '@/features/pet-farm/components/EvolutionBurstParticles';
import { PetSpeciesIcon } from '@/features/pet-farm/components/PetSpeciesIcon';
import {
    PET_EVOLUTION_AUTO_DISMISS_MS,
    PET_EVOLUTION_SKIP_AFTER_MS,
    PET_EVOLUTION_UI,
} from '@/features/pet-farm/constants/pet-evolution-ui';
import { AudioDirector } from '@/services/audio/audio-director';
import { haptics } from '@/utils/haptics';

import { useFeedbackStore } from '../store/feedback-store';
import { Confetti } from './Confetti';

const GLOW_SURFACE: ViewStyle = {
  shadowColor: theme.colors.legendary,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.65,
  shadowRadius: 28,
  elevation: 16,
};

export const PetEvolutionModal = () => {
  const celebration = useFeedbackStore((state) => state.petEvolution);
  const setPetEvolution = useFeedbackStore((state) => state.setPetEvolution);
  const clearConfetti = useFeedbackStore((state) => state.clearConfetti);

  const [canSkip, setCanSkip] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [burstActive, setBurstActive] = useState(false);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const overlayOpacity = useSharedValue(0);
  const flashOpacity = useSharedValue(0);
  const petScale = useSharedValue(0.85);
  const petGlow = useSharedValue(0);
  const rewardOpacity = useSharedValue(0);

  const clearTimers = useCallback(() => {
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  const handleClose = useCallback(() => {
    clearTimers();
    setPetEvolution(null);
    clearConfetti();
    setCanSkip(false);
    setShowReward(false);
    setBurstActive(false);
  }, [clearConfetti, clearTimers, setPetEvolution]);

  useEffect(() => {
    if (!celebration) return;

    setCanSkip(false);
    setShowReward(false);
    setBurstActive(false);
    overlayOpacity.value = 0;
    flashOpacity.value = 0;
    petScale.value = 0.85;
    petGlow.value = 0;
    rewardOpacity.value = 0;

    overlayOpacity.value = withTiming(0.88, { duration: 450 });
    haptics.heavy();

    const skipTimer = setTimeout(() => setCanSkip(true), PET_EVOLUTION_SKIP_AFTER_MS);
    const burstTimer = setTimeout(() => {
      setBurstActive(true);
      petScale.value = withSequence(
        withSpring(1.22, { damping: 8, stiffness: 160 }),
        withSpring(1, { damping: 10, stiffness: 140 }),
      );
      haptics.light();
    }, 380);

    const flashTimer = setTimeout(() => {
      flashOpacity.value = withSequence(
        withTiming(0.95, { duration: 60 }),
        withTiming(0, { duration: 140 }),
      );
    }, 620);

    const revealTimer = setTimeout(() => {
      petGlow.value = withSequence(withTiming(1, { duration: 350 }), withTiming(0.55, { duration: 600 }));
    }, 720);

    const confettiTimer = setTimeout(() => {
      void AudioDirector.playSFX('loot_reveal_legendary', { family: 'pet_evolve', priority: 'high' });
    }, 1100);

    const rewardTimer = setTimeout(() => {
      setShowReward(true);
      rewardOpacity.value = withTiming(1, { duration: 320 });
      if (celebration.coinsReward > 0) {
        void AudioDirector.playSFX('coin_pickup', { family: 'coin', delayMs: 80 });
      }
    }, 1400);

    dismissTimer.current = setTimeout(handleClose, PET_EVOLUTION_AUTO_DISMISS_MS);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(burstTimer);
      clearTimeout(flashTimer);
      clearTimeout(revealTimer);
      clearTimeout(confettiTimer);
      clearTimeout(rewardTimer);
      clearTimers();
    };
  }, [
    celebration,
    clearTimers,
    flashOpacity,
    handleClose,
    overlayOpacity,
    petGlow,
    petScale,
    rewardOpacity,
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flashOpacity.value,
  }));

  const petStyle = useAnimatedStyle(() => ({
    transform: [{ scale: petScale.value }],
    shadowOpacity: 0.25 + petGlow.value * 0.55,
  }));

  const rewardStyle = useAnimatedStyle(() => ({
    opacity: rewardOpacity.value,
    transform: [{ translateY: (1 - rewardOpacity.value) * 16 }],
  }));

  const speciesKey = celebration?.speciesKey ?? 'codeowl';

  return (
    <Modal visible={celebration !== null} transparent animationType="none" statusBarTranslucent>
      <Pressable
        style={styles.root}
        onPress={canSkip ? handleClose : undefined}
        accessibilityRole="button"
        accessibilityLabel={canSkip ? PET_EVOLUTION_UI.skipHint : PET_EVOLUTION_UI.title}>
        <Animated.View style={[styles.overlay, overlayStyle]} />
        <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />

        <View style={styles.center} pointerEvents="box-none">
          <View style={styles.burstWrap}>
            <EvolutionBurstParticles active={burstActive} />
          </View>

          <Animated.View style={[styles.petWrap, GLOW_SURFACE, petStyle]}>
            <View className="rounded-full border-4 border-legendary/60 bg-legendary/15 p-5">
              {celebration?.emoji ? (
                <Text className="text-6xl">{celebration.emoji}</Text>
              ) : (
                <PetSpeciesIcon speciesKey={speciesKey} size={72} color={theme.colors.gold} />
              )}
            </View>
          </Animated.View>

          {celebration ? (
            <View className="mt-6 items-center gap-2 px-6">
              <Text className="text-center text-xs font-bold uppercase tracking-widest text-amber-300">
                {PET_EVOLUTION_UI.title}
              </Text>
              <Text className="text-center text-3xl font-black text-legendary">
                {celebration.label}
              </Text>
              {celebration.nickname ? (
                <Text className="text-center text-sm font-bold text-foreground">
                  {celebration.nickname}
                </Text>
              ) : null}
              <Text className="text-center text-xs text-muted">
                {PET_EVOLUTION_UI.fromTo(celebration.previousLabel, celebration.label)}
              </Text>
            </View>
          ) : null}

          {showReward && celebration && celebration.coinsReward > 0 ? (
            <Animated.View style={[styles.rewardWrap, rewardStyle]}>
              <Card className="border-gold/40 bg-surface/95 px-4 py-3">
                <Text className="text-center text-[10px] font-bold uppercase text-muted">
                  {PET_EVOLUTION_UI.rewardTitle}
                </Text>
                <Text className="text-center text-lg font-black text-gold">
                  {PET_EVOLUTION_UI.rewardCoins(celebration.coinsReward)}
                </Text>
              </Card>
            </Animated.View>
          ) : null}

          {canSkip ? (
            <Text className="mt-8 text-center text-[10px] text-muted/80">
              {PET_EVOLUTION_UI.skipHint}
            </Text>
          ) : null}
        </View>

        <View style={styles.confettiLayer} pointerEvents="none">
          <Confetti active={celebration !== null && burstActive} />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#050508',
  },
  flash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  burstWrap: {
    position: 'absolute',
    top: '34%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  petWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardWrap: {
    marginTop: 20,
    width: '100%',
    maxWidth: 280,
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
