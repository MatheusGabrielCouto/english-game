import { Text, View } from 'react-native';

import { Card } from '@/components';
import type { PetMoodValue } from '@/types/pet';

import { MOOD_CONFIG } from '../constants';

type PetMessageCardProps = {
  mood: PetMoodValue;
};

export const PetMessageCard = ({ mood }: PetMessageCardProps) => {
  const config = MOOD_CONFIG[mood];

  return (
    <Card elevated accent>
      <View className="items-center gap-3 py-2">
        <Text className="text-4xl">{config.emoji}</Text>
        <Text className="text-center text-base font-medium text-foreground">{config.message}</Text>
      </View>
    </Card>
  );
};
