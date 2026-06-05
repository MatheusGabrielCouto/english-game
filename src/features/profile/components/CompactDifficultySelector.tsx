import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  DIFFICULTY_CONFIG,
  DIFFICULTY_ORDER,
  type LearningDifficultyValue,
} from '@/features/game-design/constants/difficulty';
import { TOUCH_TARGET_CHIP_CLASS } from '@/constants/touch-target-ui';
import { cn } from '@/utils';

type CompactDifficultySelectorProps = {
  value: LearningDifficultyValue;
  onChange: (value: LearningDifficultyValue) => void;
};

export const CompactDifficultySelector = ({ value, onChange }: CompactDifficultySelectorProps) => (
  <View className="gap-2">
    <Text className="text-xs font-semibold text-foreground-secondary">Ritmo de estudo</Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 pr-1">
      {DIFFICULTY_ORDER.map((difficulty) => {
        const config = DIFFICULTY_CONFIG[difficulty];
        const isActive = value === difficulty;

        return (
          <Pressable
            key={difficulty}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(difficulty)}
            className={cn(
              'rounded-xl border px-3',
              TOUCH_TARGET_CHIP_CLASS,
              isActive ? 'border-primary bg-primary/15' : 'border-border bg-surface',
            )}>
            <Text className={cn('text-sm font-bold', isActive ? 'text-primary' : 'text-foreground')}>
              {config.label}
            </Text>
            <Text className="text-[10px] text-muted">
              {config.dailyMissionCount} missões · XP ×{config.xpMultiplier}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  </View>
);
