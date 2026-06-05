import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { cn } from '@/utils';

import { PET_GEN_TIER_STYLES, PET_GEN_UI } from '../constants/pet-gen-ui';
import { getPetGenTierLabel, getPetGenVisualTier } from '../utils/pet-generation';

type PetGenBadgeProps = {
  generation: number;
  size?: 'sm' | 'md' | 'lg';
  showTierLabel?: boolean;
};

const sizeClasses = {
  sm: { badge: 'px-1.5 py-0.5', text: 'text-[9px]', tier: 'text-[8px]' },
  md: { badge: 'px-2 py-0.5', text: 'text-[10px]', tier: 'text-[9px]' },
  lg: { badge: 'px-2.5 py-1', text: 'text-xs', tier: 'text-[10px]' },
};

export const PetGenBadge = ({ generation, size = 'md', showTierLabel = false }: PetGenBadgeProps) => {
  const tier = getPetGenVisualTier(generation);
  const styles = PET_GEN_TIER_STYLES[tier];
  const tierLabel = getPetGenTierLabel(generation);
  const sizing = sizeClasses[size];

  return (
    <View className="items-center gap-0.5">
      <View className={cn('rounded-full border', styles.badge, sizing.badge)}>
        <Text className={cn('font-black', styles.name, sizing.text)}>{PET_GEN_UI.badge(generation)}</Text>
      </View>
      {showTierLabel && tierLabel ? (
        <Text className={cn('font-bold uppercase tracking-wider text-muted', sizing.tier)}>{tierLabel}</Text>
      ) : null}
    </View>
  );
};

export const PetGenAvatarFrame = ({
  generation,
  children,
}: {
  generation: number;
  children: ReactNode;
}) => {
  const tier = getPetGenVisualTier(generation);
  const frame = PET_GEN_TIER_STYLES[tier].frame;

  return (
    <View className={cn('rounded-2xl border-2 p-1', frame)}>{children}</View>
  );
};
