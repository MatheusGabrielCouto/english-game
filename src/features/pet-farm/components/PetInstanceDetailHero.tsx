import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components';
import { STAGE_CONFIG } from '@/features/pet/constants';
import { PET_FAVORITE_TAG_ICONS, type PetInstance } from '@/types/pet-instance';

import { getSpeciesDefinition } from '../catalogs/pet-species-resolver';
import { PET_FARM_UI } from '../constants/pet-farm-ui';
import { getPetGenTierLabel } from '../utils/pet-generation';
import { PetGenAvatarFrame, PetGenBadge } from './PetGenBadge';
import { PetGenderBadge } from './PetGenderBadge';
import { PetPersonalityBadge } from './PetPersonalityBadge';
import { PetSpeciesIcon } from './PetSpeciesIcon';

type PetInstanceDetailHeroProps = {
  instance: PetInstance;
};

export const PetInstanceDetailHero = ({ instance }: PetInstanceDetailHeroProps) => {
  const bounce = useSharedValue(0);
  const species = getSpeciesDefinition(instance.speciesKey);
  const stageLabel = STAGE_CONFIG[instance.stage]?.label ?? instance.stage;
  const tierLabel = getPetGenTierLabel(instance.generation);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(withTiming(-8, { duration: 1000 }), withTiming(0, { duration: 1000 })),
      -1,
      true,
    );
  }, [bounce]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bounce.value }],
  }));

  return (
    <Card className="items-center gap-3 border-primary/20 bg-primary/5 py-6">
      <PetGenAvatarFrame generation={instance.generation}>
        <Animated.View style={animatedStyle} className="flex-row items-center gap-2">
          <PetSpeciesIcon speciesKey={instance.speciesKey} size={88} color="#fbbf24" />
          <PetGenderBadge gender={instance.gender} size="md" />
        </Animated.View>
      </PetGenAvatarFrame>
      <PetGenBadge generation={instance.generation} size="lg" showTierLabel />
      <View className="flex-row items-center gap-2">
        {instance.favoriteTag !== 'none' ? (
          <Text className="text-xl">{PET_FAVORITE_TAG_ICONS[instance.favoriteTag]}</Text>
        ) : null}
        <Text className="text-2xl font-black text-foreground">{instance.nickname}</Text>
      </View>
      {tierLabel ? (
        <Text className="text-xs font-bold uppercase tracking-widest text-primary/90">{tierLabel}</Text>
      ) : null}
      <Text className="text-sm text-muted">
        {species.name} · {stageLabel} · Nv. {instance.level}
      </Text>
      {instance.isActive ? (
        <View className="rounded-full bg-primary/20 px-3 py-1">
          <Text className="text-xs font-bold text-primary">{PET_FARM_UI.activeCompanion}</Text>
        </View>
      ) : null}
      <View className="w-full px-2">
        <PetPersonalityBadge personalityKey={instance.personalityKey} />
      </View>
    </Card>
  );
};
