import { Text, View } from 'react-native';

import type { PetGenderValue } from '@/types/pet-instance';
import { cn } from '@/utils';

type PetGenderBadgeProps = {
  gender: PetGenderValue;
  size?: 'sm' | 'md';
};

export const PetGenderBadge = ({ gender, size = 'sm' }: PetGenderBadgeProps) => {
  const isFemale = gender === 'female';
  return (
    <View
      className={cn(
        'rounded-full px-1.5',
        size === 'md' ? 'py-0.5' : 'py-px',
        isFemale ? 'bg-pink-500/20' : 'bg-sky-500/20',
      )}>
      <Text
        className={cn(
          'font-bold',
          size === 'md' ? 'text-xs' : 'text-[10px]',
          isFemale ? 'text-pink-300' : 'text-sky-300',
        )}>
        {isFemale ? '♀' : '♂'}
      </Text>
    </View>
  );
};
