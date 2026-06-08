import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components';
import {
    DIFFICULTY_CONFIG,
    DIFFICULTY_ORDER,
    type LearningDifficultyValue,
} from '@/features/game-design/constants/difficulty';
import { cn } from '@/utils';

type DifficultySelectorProps = {
  value: LearningDifficultyValue;
  onChange: (value: LearningDifficultyValue) => void;
};

export const DifficultySelector = ({ value, onChange }: DifficultySelectorProps) => (
  <Card elevated>
    <Text className="text-sm text-foreground-secondary">Ritmo de aprendizado</Text>
    <Text className="mt-1  text-foreground">
      Escolha seu ritmo. Isso afeta missões, recompensas e contratos.
    </Text>
    <View className="mt-4 gap-2">
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
              'rounded-xl border px-4 py-3',
              isActive ? 'border-primary bg-primary/15' : 'border-border bg-surface',
            )}
          >
            <Text className={cn('font-semibold', isActive ? 'text-primary' : 'text-foreground')}>
              {config.label}
            </Text>
            <Text className="mt-1 text-xs text-foreground-secondary">{config.description}</Text>
            <Text className="mt-2 text-xs text-muted">
              {config.dailyMissionCount} missões/dia · XP ×{config.xpMultiplier} · Coins ×{config.coinMultiplier}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </Card>
);
