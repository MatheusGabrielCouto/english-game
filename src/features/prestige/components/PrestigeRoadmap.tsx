import { useState } from 'react';
import { Text, View } from 'react-native';

import { Card } from '@/components';
import { PressableScale } from '@/components/ui/game';
import { PRESTIGE_CATALOG } from '@/features/prestige/constants/prestige-catalog';
import type { PrestigeTierDefinition } from '@/types/prestige';
import { cn } from '@/utils';

type PrestigeRoadmapProps = {
  currentPrestige: number;
  playerLevel: number;
  onSelectTier: (tier: PrestigeTierDefinition) => void;
};

export const PrestigeRoadmap = ({ currentPrestige, playerLevel, onSelectTier }: PrestigeRoadmapProps) => (
  <View className="items-center gap-1 py-2">
    {PRESTIGE_CATALOG.map((tier, index) => {
      const unlocked = currentPrestige >= tier.level;
      const available = !unlocked && playerLevel >= tier.requiredPlayerLevel;
      const isCurrent = currentPrestige + 1 === tier.level;

      return (
        <View key={tier.level} className="w-full items-center">
          <PressableScale
            onPress={() => onSelectTier(tier)}
            accessibilityRole="button"
            accessibilityLabel={`Prestígio ${tier.roman} ${tier.name}`}
            className="w-full">
            <Card
              elevated
              className={cn(
                'px-4 py-3',
                unlocked && 'border-success/40 bg-success/5',
                available && 'border-gold/50 bg-gold/10',
                isCurrent && 'border-primary/50',
              )}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold uppercase text-muted">
                    Prestígio {tier.roman}
                  </Text>
                  <Text className="text-sm font-black text-foreground">{tier.name}</Text>
                  <Text className="text-[10px] text-foreground-secondary">
                    Nível {tier.requiredPlayerLevel}+
                  </Text>
                </View>
                <Text className="text-xl">
                  {unlocked ? '✅' : available ? '🚀' : '🔒'}
                </Text>
              </View>
            </Card>
          </PressableScale>
          {index < PRESTIGE_CATALOG.length - 1 ? (
            <Text className="my-1 text-lg text-muted">↓</Text>
          ) : null}
        </View>
      );
    })}
  </View>
);
