import { type Href, router } from 'expo-router';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { AppIcon } from '@/components/ui/AppIcon';
import { routes, theme } from '@/constants';
import type { Pet } from '@/types/pet';

import { usePet } from '../hooks/use-pet';
import { getAffinityTier } from '../utils/affinity';
import { getPetDisplayInfo } from '../utils/display';

export const PetPreviewCard = () => {
  const { pet } = usePet();

  if (!pet) {
    return (
      <Card elevated accent className="border-legendary/20">
        <Text className="text-xs font-bold uppercase tracking-widest text-legendary">🐾 Companheiro</Text>
        <Text className="mt-2 text-sm text-foreground-secondary">
          Seu pet aparecerá aqui quando estiver pronto.
        </Text>
      </Card>
    )
  }

  const display = getPetDisplayInfo(pet);
  const affinityTier = getAffinityTier(pet.affinity);

  const handlePress = () => {
    router.push(routes.pet as Href);
  };

  return (
    <PressableScale
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Ver ${display.name}`}>
      <Card elevated accent className="border-legendary/30">
        <View className="flex-row items-center gap-4">
          <View className="rounded-2xl border-2 border-legendary/40 bg-legendary/10 p-3">
            <Text className="text-5xl">{display.displayEmoji}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs font-bold uppercase tracking-widest text-legendary">
              🐾 {display.name}
            </Text>
            <Text className="text-xl font-black text-foreground">
              {display.speciesName} · {display.stageLabel} · Nv. {display.level}
            </Text>
            <Text className="mt-1 text-xs text-muted">
              {display.moodEmoji} {display.moodLabel} · {affinityTier.emoji} {pet.affinity} afinidade
            </Text>
          </View>
          <AppIcon name="chevron-forward" size={20} color={theme.colors.muted} />
        </View>
      </Card>
    </PressableScale>
  );
};

type PetPreviewCardProps = {
  pet?: Pet;
};

export const PetPreviewCardStatic = ({ pet }: PetPreviewCardProps) => {
  if (!pet) return null;

  const display = getPetDisplayInfo(pet);

  return (
    <Card elevated accent className="border-legendary/30">
      <View className="flex-row items-center gap-4">
        <Text className="text-5xl">{display.displayEmoji}</Text>
        <View className="flex-1">
          <Text className="text-xs font-bold uppercase tracking-widest text-legendary">{display.name}</Text>
          <Text className="text-xl font-black text-foreground">
            {display.speciesName} · {display.stageLabel} · Nv. {display.level}
          </Text>
        </View>
      </View>
    </Card>
  );
};
