import { Text, View } from 'react-native';

import { Card } from '@/components';
import type { PetMoodValue } from '@/types/pet';

import { MOOD_CONFIG } from '../constants';

type PetMoodCardProps = {
  mood: PetMoodValue;
};

export const PetMoodCard = ({ mood }: PetMoodCardProps) => {
  const config = MOOD_CONFIG[mood];

  return (
    <Card elevated>
      <Text className="text-sm text-foreground-secondary">Humor atual</Text>
      <View className="mt-2 flex-row items-center gap-3">
        <Text className="text-3xl">{config.emoji}</Text>
        <View>
          <Text className="text-lg font-semibold text-foreground">{config.label}</Text>
          <Text className="text-sm text-muted">Baseado na sua sequência de estudos</Text>
        </View>
      </View>
    </Card>
  );
};
