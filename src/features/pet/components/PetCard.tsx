import { Text, View } from 'react-native';

import { Card } from '@/components';
import type { Pet } from '@/types/pet';

import { STAGE_CONFIG } from '../constants';
import { getPetDisplayInfo } from '../utils/display';
import { getNextStage } from '../utils/xp';
import { PetStageBadge } from './PetStageBadge';
import { PetXPBar } from './PetXPBar';

type PetCardProps = {
  pet: Pet;
};

export const PetCard = ({ pet }: PetCardProps) => {
  const display = getPetDisplayInfo(pet);
  const nextStage = getNextStage(pet.stage);
  const nextStageLabel = nextStage ? STAGE_CONFIG[nextStage].label : 'Máximo';

  return (
    <Card elevated accent className="overflow-hidden">
      <View className="items-center gap-3">
        <Text className="text-6xl">{display.displayEmoji}</Text>
        <PetStageBadge stage={pet.stage} />
        <Text className="text-2xl font-bold text-foreground">{display.speciesName}</Text>
        <Text className="text-sm text-foreground-secondary">
          {display.stageLabel} · Nível {pet.level} · Humor sincronizado com sua streak
        </Text>
      </View>

      <View className="mt-6">
        <PetXPBar pet={pet} />
      </View>

      <View className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
        <Text className="text-xs text-foreground-secondary">Próxima evolução</Text>
        <Text className="mt-1  font-semibold text-foreground">{nextStageLabel}</Text>
      </View>
    </Card>
  );
};
