import { Text, View } from 'react-native';

import { ProgressBar } from '@/components';
import type { Pet } from '@/types/pet';

import { getPetXPProgress } from '../utils/xp';

type PetXPBarProps = {
  pet: Pet;
};

export const PetXPBar = ({ pet }: PetXPBarProps) => {
  const { current, required } = getPetXPProgress(pet.level, pet.experience);

  return (
    <View className="w-full">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-foreground-secondary">Nível {pet.level}</Text>
        <Text className="text-sm font-semibold text-accent">
          {current} / {required} XP
        </Text>
      </View>
      <ProgressBar
        value={current}
        max={required}
        accessibilityLabel={`Experiência do pet: ${current} de ${required}`}
      />
    </View>
  );
};
