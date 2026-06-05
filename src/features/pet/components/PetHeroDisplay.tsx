import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { PetSpeciesIcon } from '@/features/pet-farm/components/PetSpeciesIcon';
import type { Pet } from '@/types/pet';

import { PET_ANIMATIONS_BY_KEY } from '../catalogs/pet-animations-catalog';
import { PET_COSMETICS_BY_KEY } from '../catalogs/pet-cosmetics-catalog';
import { PetInteractionService } from '../services/pet-interaction-service';
import { getPetDisplayInfo } from '../utils/display';
import { ROUTINE_LABELS } from '../utils/routine';

type PetHeroDisplayProps = {
  pet: Pet;
};

export const PetHeroDisplay = ({ pet }: PetHeroDisplayProps) => {
  const [tick, setTick] = useState(0);
  const bounce = useSharedValue(0);
  const display = getPetDisplayInfo(pet);
  const animation = PET_ANIMATIONS_BY_KEY[pet.currentAnimationKey];
  const cosmetics = PetInteractionService.getEquippedCosmetics(pet);
  const routine = ROUTINE_LABELS[pet.routinePhase as keyof typeof ROUTINE_LABELS] ?? ROUTINE_LABELS.morning;

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(-6, { duration: 900 }), withTiming(0, { duration: 900 })),
      -1,
      true,
    );
  }, [bounce]);

  useEffect(() => {
    const interval = setInterval(() => setTick((value) => value + 1), 4000);
    return () => clearInterval(interval);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  const actionEmoji = animation?.emoji;
  const cosmeticIcons = Object.values(cosmetics)
    .map((key) => PET_COSMETICS_BY_KEY[key]?.icon)
    .filter(Boolean);

  return (
    <View className="items-center rounded-3xl border border-legendary/30 bg-legendary/5 px-4 py-8">
      <View className="mb-2 flex-row items-center gap-2">
        <Text className="text-xs font-bold uppercase tracking-widest text-legendary">
          {routine.emoji} {routine.label}
        </Text>
        {animation ? (
          <Text className="text-xs text-muted" key={tick}>
            {animation.label}
          </Text>
        ) : null}
      </View>

      <Animated.View style={animatedStyle} className="relative items-center justify-center py-4">
        <PetSpeciesIcon speciesKey={pet.speciesKey} size={88} color="#fbbf24" />
        {actionEmoji ? (
          <Text className="absolute -right-1 top-0 text-2xl" accessibilityLabel={animation?.label}>
            {actionEmoji}
          </Text>
        ) : null}
      </Animated.View>

      {cosmeticIcons.length > 0 ? (
        <View className="mt-3 flex-row flex-wrap justify-center gap-2">
          {cosmeticIcons.map((icon, index) => (
            <View key={`${icon}-${index}`} className="rounded-full bg-surface px-2 py-1">
              <Text className="text-lg">{icon}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <Text className="mt-4 text-3xl font-black text-foreground">{display.name}</Text>
      <Text className="mt-1 text-sm text-foreground-secondary">
        {display.speciesName} · {display.stageLabel} · Nv. {display.level}
      </Text>
    </View>
  );
};
